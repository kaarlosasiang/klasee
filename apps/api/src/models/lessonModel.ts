import mongoose from "mongoose"

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, maxlength: 50000 },
    type: {
      type: String,
      enum: ["page", "video", "file", "embed", "link"],
      default: "page",
    },
    order: { type: Number, default: 0 },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseFile",
      default: null,
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
)

lessonSchema.index({ moduleId: 1, order: 1 })

export const Lesson = mongoose.model("Lesson", lessonSchema)
