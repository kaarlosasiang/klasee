import mongoose from "mongoose"

const announcementSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

announcementSchema.index({ courseId: 1, isPinned: -1, createdAt: -1 })

export const Announcement = mongoose.model("Announcement", announcementSchema)
