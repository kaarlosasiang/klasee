import { NextFunction, Request, Response } from "express"
import { courseService } from "./courseService.js"

export const courseController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const userId = (req.authUser as any)?.id
      const filter =
        role === "instructor" ? { instructorId: userId } : {}
      const courses = await courseService.findAll(filter)
      res.json(courses)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.findById(req.params['id'] as string)
      if (!course) return res.status(404).json({ message: "Course not found" })
      res.json(course)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = (req.authUser as any)?.id
      const course = await courseService.create({ ...req.body, instructorId })
      res.status(201).json(course)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.update(req.params['id'] as string, req.body)
      if (!course) return res.status(404).json({ message: "Course not found" })
      res.json(course)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await courseService.delete(req.params['id'] as string)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
