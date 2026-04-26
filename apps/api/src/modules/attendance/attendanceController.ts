import { NextFunction, Request, Response } from "express"
import { attendanceService } from "./attendanceService.js"

export const attendanceController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, sectionId, date } = req.query
      const filter: Record<string, unknown> = {}
      if (courseId) filter.courseId = courseId
      if (sectionId) filter.sectionId = sectionId
      if (date) filter.date = date
      const records = await attendanceService.findAll(filter)
      res.json(records)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await attendanceService.create(req.body)
      res.status(201).json(record)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await attendanceService.update(String(req.params.id), req.body)
      if (!record) return res.status(404).json({ message: "Record not found" })
      res.json(record)
    } catch (err) {
      next(err)
    }
  },
}
