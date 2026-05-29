import { NextFunction, Request, Response } from "express"
import { quizAttemptService } from "./quizAttemptService.js"
import { QuizAttempt } from "../../models/quizAttemptModel.js"
import { submitQuizAttemptSchema } from "@workspace/validators"
import { getUserId } from "../../shared/utils/request.js"

export const quizAttemptController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query as { assessmentId?: string }
      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId query param is required" })
      }
      const attempts = await quizAttemptService.findByAssessment(assessmentId)
      res.json(attempts)
    } catch (err) {
      next(err)
    }
  },

  async myAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query as { assessmentId?: string }
      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId query param is required" })
      }
      const userId = getUserId(req)
      if (!userId) return res.status(401).json({ message: "Unauthorized" })
      const attempts = await quizAttemptService.findByUser(assessmentId, userId)
      res.json(attempts)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const attempt = await quizAttemptService.findById(req.params["id"] as string)
      if (!attempt) return res.status(404).json({ message: "Attempt not found" })

      const role = (req.authUser as any)?.role
      if (role === "student") {
        const requesterId = getUserId(req)
        if (String(attempt.userId) !== requesterId) {
          return res.status(403).json({ message: "Forbidden" })
        }
      }

      res.json(attempt)
    } catch (err) {
      next(err)
    }
  },

  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.body as { assessmentId: string }
      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId is required" })
      }
      const userId = getUserId(req)
      if (!userId) return res.status(401).json({ message: "Unauthorized" })
      const attempt = await quizAttemptService.startAttempt(assessmentId, userId)
      res.status(201).json(attempt)
    } catch (err) {
      next(err)
    }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await QuizAttempt.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Attempt not found" })
      if (existing.status === "completed") {
        return res.status(400).json({ message: "Attempt already completed" })
      }

      const requesterId = getUserId(req)
      if (String(existing.userId) !== requesterId) {
        return res.status(403).json({ message: "Forbidden" })
      }

      const parsed = submitQuizAttemptSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const attempt = await quizAttemptService.submitAttempt(id, parsed.data.answers)
      res.json(attempt)
    } catch (err) {
      next(err)
    }
  },
}
