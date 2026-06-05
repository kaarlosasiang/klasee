import mongoose from "mongoose"

const courseSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    semester: { type: String, required: true },
    cover: { type: String },
    icon: { type: String },
    syllabus: { type: String },
    isArchived: { type: Boolean, default: false, index: true },
    gradeBase: { type: String, enum: ["50", "75"], default: "50" },
  },
  { timestamps: true }
)

courseSchema.index({ instructorId: 1, isArchived: 1 })

export const Course = mongoose.model("Course", courseSchema)
