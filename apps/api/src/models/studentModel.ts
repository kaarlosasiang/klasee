import mongoose from "mongoose"

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    yearLevel: { type: Number, min: 1, max: 6 },
    program: { type: String }, // e.g. "BSCS", "BSIT"
    guardianName: { type: String },
    guardianContact: { type: String },
  },
  { timestamps: true }
)

export const Student = mongoose.model("Student", studentSchema)
