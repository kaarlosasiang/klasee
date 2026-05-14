import mongoose from "mongoose"

const moduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
)

moduleSchema.index({ courseId: 1, order: 1 })

export const Module = mongoose.model("Module", moduleSchema)
