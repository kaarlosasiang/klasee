import { NextFunction, Request, Response } from "express"
import { assignmentSubmissionService } from "./assignmentSubmissionService.js"
import { AssignmentSubmission } from "../../models/assignmentSubmissionModel.js"
import { verifyAssessmentOwnership } from "../../shared/utils/ownership.js"
import { getUserId } from "../../shared/utils/request.js"

export const assignmentSubmissionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query as { assessmentId?: string }
      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId query param is required" })
      }
      const owned = await verifyAssessmentOwnership(assessmentId, getUserId(req))
      if (!owned) return res.status(403).json({ message: "Forbidden" })
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
      const userId = getUserId(req)
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

      const role = (req.authUser as any)?.role
      if (role === "student") {
        const requesterId = getUserId(req)
        if (String(submission.userId) !== requesterId) {
          return res.status(403).json({ message: "Forbidden" })
        }
      }

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
      const userId = getUserId(req)
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

  async recent(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = (req.authUser as any)?.id as string
      const limit = Math.min(parseInt(req.query["limit"] as string) || 6, 20)
      const data = await assignmentSubmissionService.findRecent(instructorId, limit)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async grade(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await AssignmentSubmission.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Submission not found" })

      const owned = await verifyAssessmentOwnership(
        String(existing.assessmentId),
        getUserId(req)
      )
      if (!owned) return res.status(403).json({ message: "Forbidden" })

      const { grade, feedback } = req.body as { grade: number; feedback?: string }
      if (grade === undefined || grade === null) {
        return res.status(400).json({ message: "grade is required" })
      }
      const userId = getUserId(req)
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
