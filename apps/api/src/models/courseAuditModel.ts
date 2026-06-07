import mongoose from "mongoose"

const courseAuditSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["created", "updated", "deleted", "archived", "unarchived", "duplicated"],
      required: true,
    },
    changes: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
)

courseAuditSchema.index({ courseId: 1, createdAt: -1 })

export const CourseAudit = mongoose.model("CourseAudit", courseAuditSchema)
