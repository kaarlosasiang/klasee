import mongoose from "mongoose"

const latePolicySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    deductionType: { type: String, enum: ["percent", "flat"], default: "percent" },
    deductionPerDay: { type: Number, default: 0 },
    maxDeduction: { type: Number, default: 100 },
  },
  { _id: false }
)

const assessmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["quiz", "exam", "assignment"],
      required: true,
    },
    totalPoints: { type: Number, required: true },
    dueDate: { type: Date },
    isPublished: { type: Boolean, default: false },
    timeLimit: { type: Number },
    randomizeQuestions: { type: Boolean, default: false },
    showAnswerAfter:    { type: Boolean, default: false },
    redemptionQuestion: { type: Boolean, default: false },
    skipQuestions:      { type: Boolean, default: false },
    estimatedDuration:  { type: Number },
    tags:               { type: [String], default: [] },
    instructions: { type: String },
    allowedFileTypes: { type: [String], default: [] },
    maxFiles: { type: Number },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssignmentGroup",
    },
    latePolicy: { type: latePolicySchema },
  },
  { timestamps: true }
)

export const Assessment = mongoose.model("Assessment", assessmentSchema)
