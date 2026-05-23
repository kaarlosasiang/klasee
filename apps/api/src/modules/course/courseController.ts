import { NextFunction, Request, Response } from "express"
import { courseService } from "./courseService.js"
import {
  createCourseSchema,
  updateCourseSchema,
} from "@workspace/validators"

export const courseController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const userId = (req.authUser as any)?.id
      const filter = role === "instructor" ? { instructorId: userId } : {}
      const courses = await courseService.findAll(filter)
      res.json(courses)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const userId = (req.authUser as any)?.id
      const course = await courseService.findById(req.params["id"] as string)
      if (!course) return res.status(404).json({ message: "Course not found" })
      if (
        role === "instructor" &&
        String((course as any).instructorId?._id ?? course.instructorId) !==
          userId
      ) {
        return res.status(403).json({ message: "Forbidden" })
      }
      res.json(course)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createCourseSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const instructorId = (req.authUser as any)?.id
      const course = await courseService.create({ ...parsed.data, instructorId })
      res.status(201).json(course)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateCourseSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const role = (req.authUser as any)?.role
      const userId = (req.authUser as any)?.id
      const existing = await courseService.findById(req.params["id"] as string)
      if (!existing) return res.status(404).json({ message: "Course not found" })
      if (
        role === "instructor" &&
        String((existing as any).instructorId?._id ?? existing.instructorId) !== userId
      ) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const course = await courseService.update(
        req.params["id"] as string,
        parsed.data
      )
      res.json(course)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const userId = (req.authUser as any)?.id
      const existing = await courseService.findById(req.params["id"] as string)
      if (!existing) return res.status(404).json({ message: "Course not found" })
      if (
        role === "instructor" &&
        String((existing as any).instructorId?._id ?? existing.instructorId) !== userId
      ) {
        return res.status(403).json({ message: "Forbidden" })
      }
      await courseService.delete(req.params["id"] as string)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async listArchived(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const userId = (req.authUser as any)?.id
      if (role !== "instructor") {
        return res.status(403).json({ message: "Forbidden" })
      }
      const courses = await courseService.findArchived(userId)
      res.json(courses)
    } catch (err) {
      next(err)
    }
  },

  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const userId = (req.authUser as any)?.id
      const existing = await courseService.findById(req.params["id"] as string)
      if (!existing) return res.status(404).json({ message: "Course not found" })
      if (
        role === "instructor" &&
        String((existing as any).instructorId?._id ?? existing.instructorId) !== userId
      ) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const course = await courseService.archive(req.params["id"] as string)
      res.json(course)
    } catch (err) {
      next(err)
    }
  },

  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const userId = (req.authUser as any)?.id
      const existing = await courseService.findById(req.params["id"] as string)
      if (!existing) return res.status(404).json({ message: "Course not found" })
      if (
        role === "instructor" &&
        String((existing as any).instructorId?._id ?? existing.instructorId) !== userId
      ) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const course = await courseService.duplicate(req.params["id"] as string)
      if (!course) return res.status(404).json({ message: "Course not found" })
      res.status(201).json(course)
    } catch (err) {
      next(err)
    }
  },

  async unarchive(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const userId = (req.authUser as any)?.id
      const existing = await courseService.findById(req.params["id"] as string)
      if (!existing) return res.status(404).json({ message: "Course not found" })
      if (
        role === "instructor" &&
        String((existing as any).instructorId?._id ?? existing.instructorId) !== userId
      ) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const course = await courseService.unarchive(req.params["id"] as string)
      res.json(course)
    } catch (err) {
      next(err)
    }
  },
}
