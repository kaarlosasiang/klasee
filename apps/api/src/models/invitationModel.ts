import mongoose from "mongoose"

const invitationSchema = new mongoose.Schema(
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
    token: { type: String, unique: true, required: true },
    status: {
      type: String,
      enum: ["active", "accepted", "revoked"],
      default: "active",
    },
    expiresAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

invitationSchema.index({ token: 1 })
invitationSchema.index({ courseId: 1 })

export const Invitation = mongoose.model("Invitation", invitationSchema)
