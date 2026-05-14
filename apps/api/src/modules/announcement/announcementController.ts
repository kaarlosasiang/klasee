import { NextFunction, Request, Response } from "express"
import { announcementService } from "./announcementService.js"
import { Announcement } from "../../models/announcementModel.js"
import { createAnnouncementSchema, updateAnnouncementSchema } from "@workspace/validators"

function getRequesterId(req: Request): string {
  return String((req.authUser as any)?._id ?? (req.authUser as any)?.id)
}

export const announcementController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query as { courseId?: string }
      if (!courseId) {
        return res.status(400).json({ message: "courseId query param is required" })
      }
      const announcements = await announcementService.findByCourse(courseId)
      res.json(announcements)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createAnnouncementSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const authorId = getRequesterId(req)
      const announcement = await announcementService.create({ ...parsed.data, authorId })
      res.status(201).json(announcement)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateAnnouncementSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const id = req.params["id"] as string
      const existing = await Announcement.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Announcement not found" })
      const announcement = await announcementService.update(id, parsed.data)
      res.json(announcement)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await Announcement.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Announcement not found" })
      await announcementService.delete(id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
