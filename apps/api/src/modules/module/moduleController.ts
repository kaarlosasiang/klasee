import { NextFunction, Request, Response } from "express"
import { moduleService } from "./moduleService.js"
import { Module } from "../../models/moduleModel.js"

export const moduleController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, published } = req.query as { courseId?: string; published?: string }
      if (!courseId) {
        return res.status(400).json({ message: "courseId query param is required" })
      }
      const filter: Record<string, unknown> = { courseId }
      if (published === "true") filter.isPublished = true
      const modules = await moduleService.findByCourse(courseId, filter)
      res.json(modules)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, title, description, order } = req.body as {
        courseId: string
        title: string
        description?: string
        order?: number
      }
      if (!courseId || !title?.trim()) {
        return res.status(400).json({ message: "courseId and title are required" })
      }
      const mod = await moduleService.create({ courseId, title: title.trim(), description, order })
      res.status(201).json(mod)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await Module.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Module not found" })
      const mod = await moduleService.update(id, req.body)
      res.json(mod)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await Module.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Module not found" })
      await moduleService.delete(id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query as { courseId?: string }
      const { moduleIds } = req.body as { moduleIds: string[] }
      if (!courseId || !moduleIds?.length) {
        return res.status(400).json({ message: "courseId and moduleIds are required" })
      }
      await moduleService.reorder(courseId, moduleIds)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  },
}
