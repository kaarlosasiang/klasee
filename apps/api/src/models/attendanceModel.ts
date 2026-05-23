import mongoose from "mongoose"

const attendanceSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
    },
    note: { type: String },
  },
  { timestamps: true }
)

attendanceSchema.index({ studentId: 1, sectionId: 1, date: 1 }, { unique: true })

export const Attendance = mongoose.model("Attendance", attendanceSchema)
