import { NextFunction, Request, Response } from "express"
import { questionService } from "./questionService.js"
import { Question } from "../../models/questionModel.js"

export const questionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query as { assessmentId?: string }
      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId query param is required" })
      }
      const questions = await questionService.findByAssessment(assessmentId)
      res.json(questions)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await questionService.findById(req.params["id"] as string)
      if (!question) return res.status(404).json({ message: "Question not found" })
      res.json(question)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId, type, question, points, order, options, correctAnswer } = req.body as {
        assessmentId: string
        type: "multiple_choice" | "true_false" | "essay" | "fill_in"
        question: string
        points?: number
        order?: number
        options?: { text: string; isCorrect?: boolean }[]
        correctAnswer?: string | boolean
      }
      if (!assessmentId || !type || !question?.trim()) {
        return res.status(400).json({ message: "assessmentId, type, and question are required" })
      }
      const created = await questionService.create({
        assessmentId,
        type,
        question: question.trim(),
        points,
        order,
        options,
        correctAnswer,
      })
      res.status(201).json(created)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await Question.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Question not found" })
      const question = await questionService.update(id, req.body)
      res.json(question)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await Question.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Question not found" })
      await questionService.delete(id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query as { assessmentId?: string }
      const { questionIds } = req.body as { questionIds: string[] }
      if (!assessmentId || !questionIds?.length) {
        return res.status(400).json({ message: "assessmentId and questionIds are required" })
      }
      await questionService.reorder(assessmentId, questionIds)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  },
}
