import mongoose from "mongoose"

const itemBankSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    name: { type: String, required: true, maxlength: 200 },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

export const ItemBank = mongoose.model("ItemBank", itemBankSchema)
