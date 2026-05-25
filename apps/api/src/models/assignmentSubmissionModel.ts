import mongoose from "mongoose"

const submissionFileSchema = new mongoose.Schema(
  {
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "DriveFile" },
    name: { type: String },
    driveFileId: { type: String },
    mimeType: { type: String },
  },
  { _id: false }
)

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: { type: String },
    files: [submissionFileSchema],
    grade: { type: Number },
    feedback: { type: String },
    gradedAt: { type: Date },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    latePenalty: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

assignmentSubmissionSchema.index({ assessmentId: 1, userId: 1 })

export const AssignmentSubmission = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
)
