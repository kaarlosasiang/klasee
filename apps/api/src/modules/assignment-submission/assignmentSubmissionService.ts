import { AssignmentSubmission } from "../../models/assignmentSubmissionModel.js"
import { Assessment } from "../../models/assessmentModel.js"
import { calcLatePenalty } from "../../shared/utils/latePenalty.js"
import { getEffectiveDueDate } from "../../shared/utils/effectiveDueDate.js"

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
    const submission = await AssignmentSubmission.findById(id).lean()
    let latePenalty = 0
    if (submission) {
      const assessment = await Assessment.findById(submission.assessmentId).lean()
      if (assessment && submission.submittedAt) {
        const effectiveDue = await getEffectiveDueDate(
          String(submission.assessmentId),
          String(submission.userId),
          String(assessment.courseId),
          assessment.dueDate ?? undefined
        )
        latePenalty = calcLatePenalty(
          new Date(submission.submittedAt),
          effectiveDue,
          assessment.totalPoints,
          assessment.latePolicy as any
        )
      }
    }
    return AssignmentSubmission.findByIdAndUpdate(
      id,
      {
        grade: data.grade,
        feedback: data.feedback,
        gradedAt: new Date(),
        gradedBy: data.gradedBy,
        latePenalty,
      },
      { new: true }
    ).lean()
  },
}
