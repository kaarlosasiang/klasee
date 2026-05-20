import { NextFunction, Request, Response } from "express"
import { quizAttemptService } from "./quizAttemptService.js"
import { QuizAttempt } from "../../models/quizAttemptModel.js"

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
      const userId = String((req as any).authUser?._id ?? (req as any).authUser?.id)
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
      const userId = String((req as any).authUser?._id ?? (req as any).authUser?.id)
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
      const { answers } = req.body as {
        answers: { questionId: string; answer: unknown }[]
      }
      if (!answers?.length) {
        return res.status(400).json({ message: "answers are required" })
      }
      const attempt = await quizAttemptService.submitAttempt(id, answers)
      res.json(attempt)
    } catch (err) {
      next(err)
    }
  },
}
