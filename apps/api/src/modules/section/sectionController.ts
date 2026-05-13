import { NextFunction, Request, Response } from "express"
import { sectionService } from "./sectionService.js"
import { Section } from "../../models/sectionModel.js"
import {
  createSectionSchema,
  updateSectionSchema,
} from "@workspace/validators"

function getRequesterId(req: Request): string {
  return String((req.authUser as any)?._id ?? (req.authUser as any)?.id)
}

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
      const parsed = createSectionSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const instructorId = getRequesterId(req)
      const section = await sectionService.create({ ...parsed.data, instructorId })
      res.status(201).json(section)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateSectionSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const id = req.params['id'] as string
      const existing = await Section.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Section not found" })
      const requesterId = getRequesterId(req)
      if (String(existing.instructorId) !== requesterId) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const section = await sectionService.update(id, parsed.data)
      res.json(section)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string
      const existing = await Section.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Section not found" })
      const requesterId = getRequesterId(req)
      if (String(existing.instructorId) !== requesterId) {
        return res.status(403).json({ message: "Forbidden" })
      }
      await sectionService.delete(id)
      res.status(204).send()
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ message: err.message })
      next(err)
    }
  },

  async generateCode(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = getRequesterId(req)
      const section = await sectionService.generateJoinCode(req.params['id'] as string, instructorId)
      res.json(section)
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ message: err.message })
      next(err)
    }
  },
}
