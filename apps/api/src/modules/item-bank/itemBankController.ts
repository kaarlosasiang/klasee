import { NextFunction, Request, Response } from "express"
import { itemBankService } from "./itemBankService.js"
import { ItemBank } from "../../models/itemBankModel.js"
import { Course } from "../../models/courseModel.js"
import { createItemBankSchema, updateItemBankSchema } from "@workspace/validators"

function getRequesterId(req: Request): string {
  return String((req.authUser as any)?.id)
}

export const itemBankController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query as { courseId?: string }
      if (!courseId) {
        return res.status(400).json({ message: "courseId query param is required" })
      }
      const banks = await itemBankService.findByCourse(courseId)
      res.json(banks)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createItemBankSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const requesterId = getRequesterId(req)
      const course = await Course.findById(parsed.data.courseId).lean()
      if (!course) return res.status(404).json({ message: "Course not found" })
      if (String(course.instructorId) !== requesterId) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const bank = await itemBankService.create({ ...parsed.data, instructorId: requesterId })
      res.status(201).json(bank)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateItemBankSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const requesterId = getRequesterId(req)
      const existing = await ItemBank.findById(req.params["id"]).lean()
      if (!existing) return res.status(404).json({ message: "Item bank not found" })
      if (String(existing.instructorId) !== requesterId) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const bank = await itemBankService.update(req.params["id"] as string, parsed.data.name as string)
      res.json(bank)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = getRequesterId(req)
      const existing = await ItemBank.findById(req.params["id"]).lean()
      if (!existing) return res.status(404).json({ message: "Item bank not found" })
      if (String(existing.instructorId) !== requesterId) {
        return res.status(403).json({ message: "Forbidden" })
      }
      await itemBankService.delete(req.params["id"] as string)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
