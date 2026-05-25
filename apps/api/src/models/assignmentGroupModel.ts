import mongoose from "mongoose"

const assignmentGroupSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    name: { type: String, required: true, maxlength: 100 },
    weight: { type: Number, required: true, min: 0, max: 100 },
    dropLowest: { type: Number, default: 0, min: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

assignmentGroupSchema.index({ courseId: 1, order: 1 })

export const AssignmentGroup = mongoose.model("AssignmentGroup", assignmentGroupSchema)
