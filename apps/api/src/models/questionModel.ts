import mongoose from "mongoose"

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
)

const questionSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["multiple_choice", "true_false", "essay", "fill_in"],
      required: true,
    },
    question: { type: String, required: true },
    points: { type: Number, required: true, default: 1 },
    order: { type: Number, default: 0 },
    options: { type: [optionSchema], default: undefined },
    correctAnswer: { type: mongoose.Schema.Types.Mixed }, // string for fill_in, boolean for true_false
    required: { type: Boolean, default: true },
    multipleAnswers: { type: Boolean, default: false },
    randomizeOrder: { type: Boolean, default: false },
    estimationTime: { type: Number, default: undefined },
  },
  { timestamps: true }
)

export const Question = mongoose.model("Question", questionSchema)
