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
    dueDate: { type: Date },
    isPublished: { type: Boolean, default: false },
    timeLimit: { type: Number },
    randomizeQuestions: { type: Boolean, default: false },
    instructions: { type: String },
    allowedFileTypes: { type: [String], default: [] },
    maxFiles: { type: Number },
  },
  { timestamps: true }
)

export const Assessment = mongoose.model("Assessment", assessmentSchema)
