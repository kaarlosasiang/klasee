import mongoose, { Schema } from "mongoose"

const tipSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 500 },
    context: {
      type: String,
      required: true,
      enum: ["ungradedSubmissions", "draftItems", "upcomingDueDates", "attendanceToTake", "general"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

tipSchema.index({ context: 1, isActive: 1 })

export const Tip = mongoose.model("Tip", tipSchema)
