import { NextFunction, Request, Response } from "express"
import { gradebookService } from "./gradebookService.js"
import { verifyCourseOwnership } from "../../shared/utils/ownership.js"
import { getUserId } from "../../shared/utils/request.js"

export const gradebookController = {
  async getCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, page, limit } = req.query as {
        courseId?: string
        page?: string
        limit?: string
      }
      if (!courseId) return res.status(400).json({ message: "courseId is required" })
      const owned = await verifyCourseOwnership(courseId, getUserId(req))
      if (!owned) return res.status(403).json({ message: "Forbidden" })
      const data = await gradebookService.getCourseGradebook(
        courseId,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 20
      )
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
