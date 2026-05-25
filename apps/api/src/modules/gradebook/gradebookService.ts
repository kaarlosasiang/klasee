import mongoose from "mongoose"
import { Assessment } from "../../models/assessmentModel.js"
import { AssignmentGroup } from "../../models/assignmentGroupModel.js"
import { Enrollment } from "../../models/enrollmentModel.js"
import { QuizAttempt } from "../../models/quizAttemptModel.js"
import { AssignmentSubmission } from "../../models/assignmentSubmissionModel.js"

interface RawScore {
  earned: number
  possible: number
  latePenalty: number
}

function toId(v: unknown): string {
  return String(v instanceof mongoose.Types.ObjectId ? v : (v as any)._id ?? v)
}

function calcGroupScores(
  groupAssessmentIds: string[],
  groupAssessments: { _id: string; totalPoints: number }[],
  scoreMap: Map<string, RawScore>,
  dropLowest: number
) {
  // --- Final score: missing submissions count as 0 ---
  const allScores = groupAssessments.map((a) => {
    const s = scoreMap.get(a._id)
    return { earned: s?.earned ?? 0, possible: a.totalPoints, isGraded: !!s }
  })

  const sortedForFinal = [...allScores].sort(
    (a, b) => a.earned / (a.possible || 1) - b.earned / (b.possible || 1)
  )
  const keptForFinal = sortedForFinal.slice(dropLowest)
  const finalEarned = keptForFinal.reduce((s, x) => s + x.earned, 0)
  const finalPossible = keptForFinal.reduce((s, x) => s + x.possible, 0)
  const finalPct = finalPossible > 0 ? (finalEarned / finalPossible) * 100 : 0

  // --- Current score: only graded assessments ---
  const gradedScores = allScores
    .filter((x) => x.isGraded)
    .sort((a, b) => a.earned / (a.possible || 1) - b.earned / (b.possible || 1))
  const keptGraded = gradedScores.slice(dropLowest)
  const currentEarned = keptGraded.reduce((s, x) => s + x.earned, 0)
  const currentPossible = keptGraded.reduce((s, x) => s + x.possible, 0)
  const currentPct = currentPossible > 0 ? (currentEarned / currentPossible) * 100 : null

  return { finalPct, currentPct, finalEarned, finalPossible, currentEarned, currentPossible }
}

export const gradebookService = {
  async getCourseGradebook(courseId: string) {
    const [assessments, groups, enrollments] = await Promise.all([
      Assessment.find({ courseId }).lean(),
      AssignmentGroup.find({ courseId }).sort({ order: 1 }).lean(),
      Enrollment.find({ courseId, status: "active" })
        .populate("studentId", "name email")
        .lean(),
    ])

    const assessmentIds = assessments.map((a) => a._id)
    const studentIds = enrollments.map((e) => toId((e.studentId as any)._id))

    const [quizAttempts, submissions] = await Promise.all([
      QuizAttempt.find({
        assessmentId: { $in: assessmentIds },
        userId: { $in: studentIds },
        status: "completed",
      }).lean(),
      AssignmentSubmission.find({
        assessmentId: { $in: assessmentIds },
        userId: { $in: studentIds },
        grade: { $exists: true, $ne: null },
      }).lean(),
    ])

    // Build scoreMap: studentId → assessmentId → { earned, possible }
    const scoreMap = new Map<string, Map<string, RawScore>>()

    for (const attempt of quizAttempts) {
      const sid = toId(attempt.userId)
      const aid = toId(attempt.assessmentId)
      if (!scoreMap.has(sid)) scoreMap.set(sid, new Map())
      const penalty = (attempt as any).latePenalty ?? 0
      scoreMap.get(sid)!.set(aid, {
        earned: attempt.totalPointsEarned,
        possible: attempt.totalPointsPossible,
        latePenalty: penalty,
      })
    }

    for (const sub of submissions) {
      const sid = toId(sub.userId)
      const aid = toId(sub.assessmentId)
      const assessment = assessments.find((a) => toId(a._id) === aid)
      if (!scoreMap.has(sid)) scoreMap.set(sid, new Map())
      const penalty = (sub as any).latePenalty ?? 0
      scoreMap.get(sid)!.set(aid, {
        earned: Math.max(0, (sub.grade as number) - penalty),
        possible: assessment?.totalPoints ?? 0,
        latePenalty: penalty,
      })
    }

    const groupMap = new Map(groups.map((g) => [toId(g._id), g]))

    const students = enrollments.map((enrollment) => {
      const student = enrollment.studentId as any
      const sid = toId(student._id)
      const studentScores = scoreMap.get(sid) ?? new Map<string, RawScore>()

      const assessmentScores = assessments.map((a) => {
        const aid = toId(a._id)
        const s = studentScores.get(aid)
        return {
          assessmentId: aid,
          groupId: a.groupId ? toId(a.groupId) : null,
          earned: s?.earned ?? null,
          possible: a.totalPoints,
          isGraded: !!s,
          latePenalty: s?.latePenalty ?? 0,
        }
      })

      // Per-group summaries
      const groupSummaries = groups.map((group) => {
        const gid = toId(group._id)
        const groupAssessments = assessments
          .filter((a) => a.groupId && toId(a.groupId) === gid)
          .map((a) => ({ _id: toId(a._id), totalPoints: a.totalPoints }))

        const { finalPct, currentPct, finalEarned, finalPossible } = calcGroupScores(
          groupAssessments.map((a) => a._id),
          groupAssessments,
          studentScores,
          group.dropLowest
        )

        return {
          groupId: gid,
          name: group.name,
          weight: group.weight,
          dropLowest: group.dropLowest,
          finalPct,
          currentPct,
          finalEarned,
          finalPossible,
        }
      })

      // Weighted final score (treat missing as 0, sum across all groups)
      const totalWeight = groupSummaries.reduce((s, g) => s + g.weight, 0)
      const finalScore =
        totalWeight > 0
          ? groupSummaries.reduce((s, g) => s + (g.finalPct * g.weight) / 100, 0)
          : null

      // Weighted current score (only groups that have graded work, normalise weights)
      const gradedGroups = groupSummaries.filter((g) => g.currentPct !== null)
      const gradedWeight = gradedGroups.reduce((s, g) => s + g.weight, 0)
      const currentScore =
        gradedWeight > 0
          ? gradedGroups.reduce((s, g) => s + (g.currentPct! * g.weight) / gradedWeight, 0)
          : null

      return {
        student: { _id: sid, name: student.name, email: student.email },
        assessmentScores,
        groupSummaries,
        currentScore,
        finalScore,
      }
    })

    return { assessments, groups, students }
  },

  async getStudentGradebook(courseId: string, studentId: string) {
    const [assessments, groups] = await Promise.all([
      Assessment.find({ courseId, isPublished: true }).lean(),
      AssignmentGroup.find({ courseId }).sort({ order: 1 }).lean(),
    ])

    const assessmentIds = assessments.map((a) => a._id)

    const [quizAttempts, submissions] = await Promise.all([
      QuizAttempt.find({
        assessmentId: { $in: assessmentIds },
        userId: studentId,
        status: "completed",
      }).lean(),
      AssignmentSubmission.find({
        assessmentId: { $in: assessmentIds },
        userId: studentId,
        grade: { $exists: true, $ne: null },
      }).lean(),
    ])

    const studentScores = new Map<string, RawScore>()

    for (const attempt of quizAttempts) {
      const penalty = (attempt as any).latePenalty ?? 0
      studentScores.set(toId(attempt.assessmentId), {
        earned: attempt.totalPointsEarned,
        possible: attempt.totalPointsPossible,
        latePenalty: penalty,
      })
    }

    for (const sub of submissions) {
      const aid = toId(sub.assessmentId)
      const assessment = assessments.find((a) => toId(a._id) === aid)
      const penalty = (sub as any).latePenalty ?? 0
      studentScores.set(aid, {
        earned: Math.max(0, (sub.grade as number) - penalty),
        possible: assessment?.totalPoints ?? 0,
        latePenalty: penalty,
      })
    }

    const assessmentScores = assessments.map((a) => {
      const aid = toId(a._id)
      const s = studentScores.get(aid)
      return {
        assessmentId: aid,
        title: a.title,
        type: a.type,
        groupId: a.groupId ? toId(a.groupId) : null,
        earned: s?.earned ?? null,
        possible: a.totalPoints,
        isGraded: !!s,
        dueDate: a.dueDate,
        latePenalty: s?.latePenalty ?? 0,
      }
    })

    const groupSummaries = groups.map((group) => {
      const gid = toId(group._id)
      const groupAssessments = assessments
        .filter((a) => a.groupId && toId(a.groupId) === gid)
        .map((a) => ({ _id: toId(a._id), totalPoints: a.totalPoints }))

      const { finalPct, currentPct, finalEarned, finalPossible } = calcGroupScores(
        groupAssessments.map((a) => a._id),
        groupAssessments,
        studentScores,
        group.dropLowest
      )

      return {
        groupId: gid,
        name: group.name,
        weight: group.weight,
        dropLowest: group.dropLowest,
        finalPct,
        currentPct,
        finalEarned,
        finalPossible,
      }
    })

    const totalWeight = groupSummaries.reduce((s, g) => s + g.weight, 0)
    const finalScore =
      totalWeight > 0
        ? groupSummaries.reduce((s, g) => s + (g.finalPct * g.weight) / 100, 0)
        : null

    const gradedGroups = groupSummaries.filter((g) => g.currentPct !== null)
    const gradedWeight = gradedGroups.reduce((s, g) => s + g.weight, 0)
    const currentScore =
      gradedWeight > 0
        ? gradedGroups.reduce((s, g) => s + (g.currentPct! * g.weight) / gradedWeight, 0)
        : null

    return { assessments: assessmentScores, groups: groupSummaries, currentScore, finalScore }
  },
}
