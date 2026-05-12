import mongoose from "mongoose"

const courseSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    semester: { type: String, required: true },
    cover: { type: String },
    icon: { type: String },
    syllabus: { type: String },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Course = mongoose.model("Course", courseSchema)
