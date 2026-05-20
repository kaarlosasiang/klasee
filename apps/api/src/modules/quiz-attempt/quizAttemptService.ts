import { QuizAttempt } from "../../models/quizAttemptModel.js"
import { Question } from "../../models/questionModel.js"

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
    return QuizAttempt.create({ assessmentId, userId })
  },

  async submitAttempt(id: string, answers: { questionId: string; answer: unknown }[]) {
    const attempt = await QuizAttempt.findById(id)
    if (!attempt || attempt.status === "completed") {
      throw new Error("Attempt not found or already completed")
    }

    const questions = await Question.find({
      _id: { $in: answers.map((a) => a.questionId) },
    }).lean()

    let totalPointsEarned = 0
    const totalPointsPossible = questions.reduce((sum, q) => sum + (q.points || 1), 0)

    const gradedAnswers = answers.map((submitted) => {
      const question = questions.find(
        (q) => q._id.toString() === submitted.questionId
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

    attempt.answers = gradedAnswers as any
    attempt.totalPointsEarned = totalPointsEarned
    attempt.totalPointsPossible = totalPointsPossible
    attempt.status = "completed"
    attempt.completedAt = new Date()

    await attempt.save()
    return attempt.toObject()
  },
}
