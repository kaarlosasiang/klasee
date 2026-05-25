import mongoose from "mongoose"
import { Assessment } from "../../models/assessmentModel.js"
import { AssessmentScore } from "../../models/assessmentScore.js"
import { DueDateOverride } from "../../models/dueDateOverrideModel.js"
import { Enrollment } from "../../models/enrollmentModel.js"

function toId(v: unknown): string {
  return String(v instanceof mongoose.Types.ObjectId ? v : (v as any))
}

export const assessmentService = {
  async findAll(filter: Record<string, unknown> = {}, studentId?: string) {
    const assessments = await Assessment.find(filter).lean()
    if (!studentId) return assessments

    const assessmentIds = assessments.map((a) => a._id)
    const courseIds = [...new Set(assessments.map((a) => toId(a.courseId)))]

    const [overrides, enrollments] = await Promise.all([
      DueDateOverride.find({ assessmentId: { $in: assessmentIds } }).lean(),
      Enrollment.find({ studentId, courseId: { $in: courseIds }, status: "active" }).lean(),
    ])

    const sectionIdByCourse = new Map(
      enrollments.map((e) => [toId(e.courseId), toId(e.sectionId)])
    )

    return assessments.map((a) => {
      const aId = toId(a._id)
      const sectionId = sectionIdByCourse.get(toId(a.courseId))

      const studentOverride = overrides.find(
        (o) => toId(o.assessmentId) === aId && o.type === "student" && toId(o.targetId) === studentId
      )
      if (studentOverride) return { ...a, effectiveDueDate: studentOverride.dueDate }

      if (sectionId) {
        const sectionOverride = overrides.find(
          (o) => toId(o.assessmentId) === aId && o.type === "section" && toId(o.targetId) === sectionId
        )
        if (sectionOverride) return { ...a, effectiveDueDate: sectionOverride.dueDate }
      }

      return { ...a, effectiveDueDate: a.dueDate ?? undefined }
    })
  },

  async findById(id: string) {
    return Assessment.findById(id).lean()
  },

  async create(data: {
    courseId: string
    title: string
    type: "quiz" | "exam" | "assignment"
    totalPoints: number
    dueDate?: string | Date
    isPublished?: boolean
  }) {
    return Assessment.create(data)
  },

  async update(id: string, data: Partial<{ title: string; type: string; totalPoints: number; dueDate: string | Date; isPublished: boolean }>) {
    return Assessment.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    const { Question } = await import("../../models/questionModel.js")
    const { QuizAttempt } = await import("../../models/quizAttemptModel.js")
    await Promise.all([
      Question.deleteMany({ assessmentId: id }),
      QuizAttempt.deleteMany({ assessmentId: id }),
      AssessmentScore.deleteMany({ assessmentId: id }),
      DueDateOverride.deleteMany({ assessmentId: id }),
    ])
    return Assessment.findByIdAndDelete(id)
  },

  async findScores(filter: Record<string, unknown> = {}) {
    return AssessmentScore.find(filter)
      .populate("studentId", "name email")
      .lean()
  },

  async createScore(data: {
    assessmentId: string
    studentId: string
    score: number
    feedback?: string
  }) {
    return AssessmentScore.create(data)
  },

  async updateScore(id: string, data: Partial<{ score: number; feedback: string }>) {
    return AssessmentScore.findByIdAndUpdate(id, data, { new: true }).lean()
  },
}
