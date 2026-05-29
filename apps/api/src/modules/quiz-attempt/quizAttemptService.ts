import { QuizAttempt } from "../../models/quizAttemptModel.js"
import { Question } from "../../models/questionModel.js"
import { Assessment } from "../../models/assessmentModel.js"
import { calcLatePenalty } from "../../shared/utils/latePenalty.js"
import { getEffectiveDueDate } from "../../shared/utils/effectiveDueDate.js"

export const quizAttemptService = {
  async findByAssessment(assessmentId: string) {
    return QuizAttempt.find({ assessmentId }).populate("userId", "name email").lean()
  },

  async findByUser(assessmentId: string, userId: string) {
    return QuizAttempt.find({ assessmentId, userId }).populate("userId", "name email").lean()
  },

  async findById(id: string) {
    return QuizAttempt.findById(id)
      .populate("userId", "name email")
      .populate("answers.questionId", "question type points options correctAnswer")
      .lean()
  },

  async startAttempt(assessmentId: string, userId: string) {
    const existing = await QuizAttempt.findOne({
      assessmentId,
      userId,
      status: "in_progress",
    }).lean()
    if (existing) return existing

    const assessment = await Assessment.findById(assessmentId).lean()
    const timeLimit = (assessment as any)?.timeLimit as number | undefined

    return QuizAttempt.create({
      assessmentId,
      userId,
      ...(timeLimit ? { expiresAt: new Date(Date.now() + timeLimit * 60000) } : {}),
    })
  },

  async submitAttempt(id: string, answers: { questionId: string; answer?: unknown }[]) {
    const attempt = await QuizAttempt.findOne({ _id: id, status: "in_progress" })
    if (!attempt) {
      throw new Error("Attempt not found or already completed")
    }

    const questionIds = answers.map((a) => a.questionId)

    const questions = await Question.find({
      _id: { $in: questionIds },
    }).lean()

    let totalPointsEarned = 0
    const totalPointsPossible = questions.reduce((sum, q) => sum + (q.points || 1), 0)

    const gradedAnswers = questionIds.map((qId) => {
      const submitted = answers.find((a) => a.questionId === qId) ?? { questionId: qId, answer: null }
      const question = questions.find(
        (q) => q._id.toString() === qId
      )
      if (!question) {
        return {
          questionId: submitted.questionId,
          answer: submitted.answer,
          isCorrect: null,
          pointsEarned: 0,
        }
      }

      let isCorrect: boolean | null = null
      let pointsEarned = 0

      if (question.type === "multiple_choice") {
        const selectedIdx = submitted.answer as number
        const correctOptionIndex = question.options?.findIndex((o) => o.isCorrect) ?? -1
        isCorrect = selectedIdx === correctOptionIndex
        pointsEarned = isCorrect ? (question.points || 1) : 0
      } else if (question.type === "true_false") {
        isCorrect = submitted.answer === question.correctAnswer
        pointsEarned = isCorrect ? (question.points || 1) : 0
      } else if (question.type === "fill_in") {
        const normalizedSubmitted = String(submitted.answer).toLowerCase().trim()
        const acceptableAnswers = String(question.correctAnswer)
          .toLowerCase()
          .split(",")
          .map((a) => a.trim())
        isCorrect = acceptableAnswers.includes(normalizedSubmitted)
        pointsEarned = isCorrect ? (question.points || 1) : 0
      } else if (question.type === "essay") {
        isCorrect = null
        pointsEarned = 0
      }

      totalPointsEarned += pointsEarned

      return {
        questionId: submitted.questionId,
        answer: submitted.answer,
        isCorrect,
        pointsEarned,
      }
    })

    const assessment = await Assessment.findById(attempt.assessmentId).lean()
    let latePenalty = 0
    if (assessment) {
      const effectiveDue = await getEffectiveDueDate(
        String(attempt.assessmentId),
        String(attempt.userId),
        String(assessment.courseId),
        assessment.dueDate ?? undefined
      )
      latePenalty = calcLatePenalty(
        new Date(),
        effectiveDue,
        totalPointsPossible,
        assessment.latePolicy as any
      )
    }

    attempt.answers = gradedAnswers as any
    attempt.totalPointsEarned = Math.max(0, totalPointsEarned - latePenalty)
    attempt.totalPointsPossible = totalPointsPossible
    ;(attempt as any).latePenalty = latePenalty
    attempt.status = "completed"
    attempt.completedAt = new Date()
    attempt.expiresAt = undefined

    await attempt.save()
    return attempt.toObject()
  },
}
