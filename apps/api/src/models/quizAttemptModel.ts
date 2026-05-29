import mongoose from "mongoose"

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    answer: { type: mongoose.Schema.Types.Mixed },
    isCorrect: { type: Boolean, default: null },
    pointsEarned: { type: Number, default: 0 },
  },
  { _id: false }
)

const quizAttemptSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    answers: [answerSchema],
    totalPointsEarned: { type: Number, default: 0 },
    totalPointsPossible: { type: Number, default: 0 },
    latePenalty: { type: Number, default: 0 },
    selectedQuestionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    expiresAt: { type: Date },
  },
  { timestamps: true }
)

quizAttemptSchema.index({ assessmentId: 1, userId: 1 })

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema)
