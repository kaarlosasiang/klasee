import mongoose from "mongoose"

const assessmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["quiz", "exam", "assignment"],
      required: true,
    },
    totalPoints: { type: Number, required: true },
    dueDate: { type: String }, // ISO date string
  },
  { timestamps: true }
)

export const Assessment = mongoose.model("Assessment", assessmentSchema)
