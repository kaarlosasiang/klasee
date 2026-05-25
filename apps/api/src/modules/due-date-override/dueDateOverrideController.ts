import { NextFunction, Request, Response } from "express"
import { dueDateOverrideService } from "./dueDateOverrideService.js"
import { Assessment } from "../../models/assessmentModel.js"
import { Course } from "../../models/courseModel.js"
import { createDueDateOverrideSchema } from "@workspace/validators"

function getRequesterId(req: Request): string {
  return String((req.authUser as any)?.id)
}

async function verifyAssessmentOwnership(
  assessmentId: string,
  requesterId: string
): Promise<boolean> {
  const assessment = await Assessment.findById(assessmentId).lean()
  if (!assessment) return false
  const course = await Course.findById(assessment.courseId).lean()
  if (!course) return false
  return String(course.instructorId) === requesterId
}

export const dueDateOverrideController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query as { assessmentId?: string }
      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId query param is required" })
      }
      const requesterId = getRequesterId(req)
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
      const requesterId = getRequesterId(req)
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

      const requesterId = getRequesterId(req)
      const allowed = await verifyAssessmentOwnership(String(existing.assessmentId), requesterId)
      if (!allowed) return res.status(403).json({ message: "Forbidden" })

      await dueDateOverrideService.delete(req.params["id"] as string)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
