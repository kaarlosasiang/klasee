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
    name: { type: String, required: true },
    schedule: { type: String },
    labSchedule: { type: String },
    room: { type: String },
    maxStudents: { type: Number, default: 40 },
    joinCode: { type: String, unique: true, sparse: true }, // instructor-generated enrollment code
  },
  { timestamps: true }
)

export const Section = mongoose.model("Section", sectionSchema)
