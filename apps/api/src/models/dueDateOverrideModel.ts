import mongoose from "mongoose"

const dueDateOverrideSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["section", "student"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
)

dueDateOverrideSchema.index(
  { assessmentId: 1, type: 1, targetId: 1 },
  { unique: true }
)

export const DueDateOverride = mongoose.model(
  "DueDateOverride",
  dueDateOverrideSchema
)
