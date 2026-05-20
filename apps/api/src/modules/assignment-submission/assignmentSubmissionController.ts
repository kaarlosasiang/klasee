import { NextFunction, Request, Response } from "express"
import { assignmentSubmissionService } from "./assignmentSubmissionService.js"
import { AssignmentSubmission } from "../../models/assignmentSubmissionModel.js"

export const assignmentSubmissionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query as { assessmentId?: string }
      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId query param is required" })
      }
      const submissions = await assignmentSubmissionService.findByAssessment(assessmentId)
      res.json(submissions)
    } catch (err) {
      next(err)
    }
  },

  async mySubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query as { assessmentId?: string }
      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId query param is required" })
      }
      const userId = String((req as any).authUser?._id ?? (req as any).authUser?.id)
      if (!userId) return res.status(401).json({ message: "Unauthorized" })
      const submission = await assignmentSubmissionService.findByUser(assessmentId, userId)
      if (!submission) return res.status(404).json({ message: "Submission not found" })
      res.json(submission)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const submission = await assignmentSubmissionService.findById(
        req.params["id"] as string
      )
      if (!submission) return res.status(404).json({ message: "Submission not found" })
      res.json(submission)
    } catch (err) {
      next(err)
    }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId, content, files } = req.body as {
        assessmentId: string
        content?: string
        files?: { fileId?: string; name?: string; driveFileId?: string; mimeType?: string }[]
      }
      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId is required" })
      }
      const userId = String((req as any).authUser?._id ?? (req as any).authUser?.id)
      if (!userId) return res.status(401).json({ message: "Unauthorized" })
      const submission = await assignmentSubmissionService.submit(assessmentId, userId, {
        content,
        files,
      })
      res.status(201).json(submission)
    } catch (err) {
      next(err)
    }
  },

  async grade(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await AssignmentSubmission.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Submission not found" })

      const { grade, feedback } = req.body as { grade: number; feedback?: string }
      if (grade === undefined || grade === null) {
        return res.status(400).json({ message: "grade is required" })
      }
      const userId = String((req as any).authUser?._id ?? (req as any).authUser?.id)
      if (!userId) return res.status(401).json({ message: "Unauthorized" })

      const submission = await assignmentSubmissionService.grade(id, {
        grade,
        feedback,
        gradedBy: userId,
      })
      res.json(submission)
    } catch (err) {
      next(err)
    }
  },
}
