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
      const requesterId = (req.authUser as any)?._id ?? (req.authUser as any)?.id
      const role = (req.authUser as any)?.role

      // Students can only enroll themselves
      if (role === "student") {
        req.body.studentId = String(requesterId)
      }

      const enrollment = await enrollmentService.create(req.body)
      res.status(201).json(enrollment)
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ message: err.message })
      if (err.code === 11000) return res.status(409).json({ message: "Already enrolled in this section" })
      next(err)
    }
  },

  async joinByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = String((req.authUser as any)?._id ?? (req.authUser as any)?.id)
      const { code } = req.body as { code?: string }
      if (!code?.trim()) return res.status(400).json({ message: "Join code is required" })
      const enrollment = await enrollmentService.joinByCode(code.trim(), studentId)
      res.status(201).json(enrollment)
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ message: err.message })
      if (err.code === 11000) return res.status(409).json({ message: "You are already enrolled in this section" })
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

  async drop(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = String((req.authUser as any)?._id ?? (req.authUser as any)?.id)
      const enrollment = await enrollmentService.drop(req.params['id'] as string, studentId)
      res.json(enrollment)
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ message: err.message })
      next(err)
    }
  },
}
