import { NextFunction, Request, Response } from "express"
import { sectionService } from "./sectionService.js"

export const sectionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query
      const filter: Record<string, unknown> = {}
      if (courseId) filter.courseId = courseId
      const sections = await sectionService.findAll(filter)
      res.json(sections)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await sectionService.findById(req.params['id'] as string)
      if (!section) return res.status(404).json({ message: "Section not found" })
      res.json(section)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = (req.authUser as any)?.id
      const section = await sectionService.create({ ...req.body, instructorId })
      res.status(201).json(section)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await sectionService.update(req.params['id'] as string, req.body)
      if (!section) return res.status(404).json({ message: "Section not found" })
      res.json(section)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await sectionService.delete(req.params['id'] as string)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
