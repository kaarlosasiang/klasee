import { AssignmentSubmission } from "../../models/assignmentSubmissionModel.js"

interface FileInfo {
  fileId?: string
  name?: string
  driveFileId?: string
  mimeType?: string
}

export const assignmentSubmissionService = {
  async findByAssessment(assessmentId: string) {
    return AssignmentSubmission.find({ assessmentId })
      .populate("userId", "name email")
      .populate("gradedBy", "name email")
      .sort({ submittedAt: -1 })
      .lean()
  },

  async findByUser(assessmentId: string, userId: string) {
    return AssignmentSubmission.findOne({ assessmentId, userId })
      .populate("userId", "name email")
      .populate("gradedBy", "name email")
      .lean()
  },

  async findById(id: string) {
    return AssignmentSubmission.findById(id)
      .populate("userId", "name email")
      .populate("gradedBy", "name email")
      .lean()
  },

  async submit(
    assessmentId: string,
    userId: string,
    data: { content?: string; files?: FileInfo[] }
  ) {
    const existing = await AssignmentSubmission.findOne({ assessmentId, userId }).lean()
    if (existing) {
      return AssignmentSubmission.findByIdAndUpdate(
        existing._id,
        { content: data.content, files: data.files, submittedAt: new Date() },
        { new: true }
      ).lean()
    }
    return AssignmentSubmission.create({
      assessmentId,
      userId,
      content: data.content,
      files: data.files,
    })
  },

  async grade(
    id: string,
    data: { grade: number; feedback?: string; gradedBy: string }
  ) {
    return AssignmentSubmission.findByIdAndUpdate(
      id,
      {
        grade: data.grade,
        feedback: data.feedback,
        gradedAt: new Date(),
        gradedBy: data.gradedBy,
      },
      { new: true }
    ).lean()
  },
}
