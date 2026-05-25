import { NextFunction, Request, Response } from "express"
import { gradebookService } from "./gradebookService.js"

export const gradebookController = {
  async getCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query
      if (!courseId) return res.status(400).json({ message: "courseId is required" })
      const data = await gradebookService.getCourseGradebook(courseId as string)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },

  async getMy(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query
      if (!courseId) return res.status(400).json({ message: "courseId is required" })
      const studentId = String((req.authUser as any)?.id)
      const data = await gradebookService.getStudentGradebook(courseId as string, studentId)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },
}
