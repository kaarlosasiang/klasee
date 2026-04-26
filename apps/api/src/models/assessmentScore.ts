import mongoose from "mongoose"

const assessmentScoreSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: { type: Number, required: true },
    feedback: { type: String },
  },
  { timestamps: true }
)

assessmentScoreSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true })

export const AssessmentScore = mongoose.model(
  "AssessmentScore",
  assessmentScoreSchema
)
