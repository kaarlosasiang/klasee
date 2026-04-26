import { NextFunction, Request, Response } from "express"
import { enrollmentService } from "./enrollmentService.js"

export const enrollmentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { sectionId, studentId } = req.query
      const filter: Record<string, unknown> = {}
      if (sectionId) filter.sectionId = sectionId
      if (studentId) filter.studentId = studentId
      const enrollments = await enrollmentService.findAll(filter)
      res.json(enrollments)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollment = await enrollmentService.create(req.body)
      res.status(201).json(enrollment)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollment = await enrollmentService.update(req.params['id'] as string, req.body)
      if (!enrollment) return res.status(404).json({ message: "Enrollment not found" })
      res.json(enrollment)
    } catch (err) {
      next(err)
    }
  },
}
