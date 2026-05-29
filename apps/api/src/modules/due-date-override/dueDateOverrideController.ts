import { NextFunction, Request, Response } from "express"
import { dueDateOverrideService } from "./dueDateOverrideService.js"
import { verifyAssessmentOwnership } from "../../shared/utils/ownership.js"
import { getUserId } from "../../shared/utils/request.js"
import { createDueDateOverrideSchema } from "@workspace/validators"

export const dueDateOverrideController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query as { assessmentId?: string }
      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId query param is required" })
      }
      const requesterId = getUserId(req)
      const allowed = await verifyAssessmentOwnership(assessmentId, requesterId)
      if (!allowed) return res.status(403).json({ message: "Forbidden" })

      const overrides = await dueDateOverrideService.findByAssessment(assessmentId)
      res.json(overrides)
    } catch (err) {
      next(err)
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createDueDateOverrideSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const requesterId = getUserId(req)
      const allowed = await verifyAssessmentOwnership(parsed.data.assessmentId, requesterId)
      if (!allowed) return res.status(403).json({ message: "Forbidden" })

      const override = await dueDateOverrideService.upsert({
        ...parsed.data,
        dueDate: new Date(parsed.data.dueDate),
      })
      res.status(201).json(override)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { DueDateOverride } = await import("../../models/dueDateOverrideModel.js")
      const existing = await DueDateOverride.findById(req.params["id"]).lean()
      if (!existing) return res.status(404).json({ message: "Override not found" })

      const requesterId = getUserId(req)
      const allowed = await verifyAssessmentOwnership(String(existing.assessmentId), requesterId)
      if (!allowed) return res.status(403).json({ message: "Forbidden" })

      await dueDateOverrideService.delete(req.params["id"] as string)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
