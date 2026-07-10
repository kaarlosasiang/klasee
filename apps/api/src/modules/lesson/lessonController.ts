import { NextFunction, Request, Response } from "express"
import { lessonService } from "./lessonService.js"
import { Lesson } from "../../models/lessonModel.js"
import { Module } from "../../models/moduleModel.js"
import { Course } from "../../models/courseModel.js"

function getRequesterId(req: Request): string {
  return String((req.authUser as any)?.id)
}

async function verifyModuleOwnership(moduleId: string, requesterId: string): Promise<boolean> {
  const mod = await Module.findById(moduleId).lean()
  if (!mod) return false
  const course = await Course.findById(mod.courseId).lean()
  return !!course && String(course.instructorId) === requesterId
}

export const lessonController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleId, published } = req.query as { moduleId?: string; published?: string }
      if (!moduleId) {
        return res.status(400).json({ message: "moduleId query param is required" })
      }
      const filter: Record<string, unknown> = {}
      if (published === "true") filter.isPublished = true
      const lessons = await lessonService.findByModule(moduleId, filter)
      res.json(lessons)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const lesson = await lessonService.findById(req.params["id"] as string)
      if (!lesson) return res.status(404).json({ message: "Lesson not found" })
      res.json(lesson)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleId, title, content, type, order, fileId } = req.body as {
        moduleId: string
        title: string
        content?: string
        type?: "page" | "video" | "file" | "embed" | "link"
        order?: number
        fileId?: string
      }
      if (!moduleId || !title?.trim()) {
        return res.status(400).json({ message: "moduleId and title are required" })
      }
      if (!(await verifyModuleOwnership(moduleId, getRequesterId(req)))) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const lesson = await lessonService.create({
        moduleId,
        title: title.trim(),
        content,
        type,
        order,
        fileId,
      })
      res.status(201).json(lesson)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await Lesson.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Lesson not found" })
      if (!(await verifyModuleOwnership(String(existing.moduleId), getRequesterId(req)))) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const lesson = await lessonService.update(id, req.body)
      res.json(lesson)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await Lesson.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Lesson not found" })
      if (!(await verifyModuleOwnership(String(existing.moduleId), getRequesterId(req)))) {
        return res.status(403).json({ message: "Forbidden" })
      }
      await lessonService.delete(id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleId } = req.query as { moduleId?: string }
      const { lessonIds } = req.body as { lessonIds: string[] }
      if (!moduleId || !lessonIds?.length) {
        return res.status(400).json({ message: "moduleId and lessonIds are required" })
      }
      if (!(await verifyModuleOwnership(moduleId, getRequesterId(req)))) {
        return res.status(403).json({ message: "Forbidden" })
      }
      await lessonService.reorder(moduleId, lessonIds)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  },
}
