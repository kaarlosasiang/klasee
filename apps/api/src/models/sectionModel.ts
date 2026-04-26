import mongoose from "mongoose"

const sectionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true }, // e.g. "Section A"
    schedule: { type: String },             // e.g. "MWF 8:00-9:00 AM"
    room: { type: String },
    maxStudents: { type: Number, default: 40 },
  },
  { timestamps: true }
)

export const Section = mongoose.model("Section", sectionSchema)
