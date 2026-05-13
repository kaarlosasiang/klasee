import mongoose from "mongoose"

const courseFileSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    name: { type: String, required: true },
    mimeType: { type: String, default: "application/vnd.google-apps.folder" },
    size: { type: Number, default: 0 },
    source: {
      type: String,
      enum: ["drive", "cloudinary"],
      default: "drive",
    },
    isFolder: { type: Boolean, default: false },
    parentFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseFile",
      default: null,
    },
    driveFileId: { type: String, default: null },
    driveParentFolderId: { type: String, default: null },
    cloudinaryUrl: { type: String, default: null },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folder: {
      type: String,
      enum: ["materials", "activities", "submissions"],
      default: "materials",
    },
  },
  { timestamps: true }
)

courseFileSchema.index({ courseId: 1, folder: 1 })
courseFileSchema.index({ driveFileId: 1 })

export const CourseFile = mongoose.model("CourseFile", courseFileSchema)
