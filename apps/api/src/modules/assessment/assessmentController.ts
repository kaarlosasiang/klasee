import { NextFunction, Request, Response } from "express"
import { assessmentService } from "./assessmentService.js"

export const assessmentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query
      const filter: Record<string, unknown> = {}
      if (courseId) filter.courseId = courseId
      const assessments = await assessmentService.findAll(filter)
      res.json(assessments)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const assessment = await assessmentService.findById(req.params['id'] as string)
      if (!assessment) return res.status(404).json({ message: "Assessment not found" })
      res.json(assessment)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const assessment = await assessmentService.create(req.body)
      res.status(201).json(assessment)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const assessment = await assessmentService.update(req.params['id'] as string, req.body)
      if (!assessment) return res.status(404).json({ message: "Assessment not found" })
      res.json(assessment)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await assessmentService.delete(req.params['id'] as string)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async listScores(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId, studentId } = req.query
      const filter: Record<string, unknown> = {}
      if (assessmentId) filter.assessmentId = assessmentId
      if (studentId) filter.studentId = studentId
      const scores = await assessmentService.findScores(filter)
      res.json(scores)
    } catch (err) {
      next(err)
    }
  },

  async createScore(req: Request, res: Response, next: NextFunction) {
    try {
      const score = await assessmentService.createScore(req.body)
      res.status(201).json(score)
    } catch (err) {
      next(err)
    }
  },

  async updateScore(req: Request, res: Response, next: NextFunction) {
    try {
      const score = await assessmentService.updateScore(req.params['id'] as string, req.body)
      if (!score) return res.status(404).json({ message: "Score not found" })
      res.json(score)
    } catch (err) {
      next(err)
    }
  },
}
