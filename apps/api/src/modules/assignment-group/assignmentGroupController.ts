import { NextFunction, Request, Response } from "express"
import { assignmentGroupService } from "./assignmentGroupService.js"
import { AssignmentGroup } from "../../models/assignmentGroupModel.js"
import { Course } from "../../models/courseModel.js"
import {
  createAssignmentGroupSchema,
  updateAssignmentGroupSchema,
} from "@workspace/validators"

function getRequesterId(req: Request): string {
  return String((req.authUser as any)?.id)
}

export const assignmentGroupController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query
      if (!courseId) return res.status(400).json({ message: "courseId is required" })
      const groups = await assignmentGroupService.findByCourse(courseId as string)
      res.json(groups)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createAssignmentGroupSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const userId = getRequesterId(req)
      const course = await Course.findById(parsed.data.courseId).lean()
      if (!course) return res.status(404).json({ message: "Course not found" })
      if (String(course.instructorId) !== userId)
        return res.status(403).json({ message: "Forbidden" })
      const group = await assignmentGroupService.create(parsed.data)
      res.status(201).json(group)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateAssignmentGroupSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const userId = getRequesterId(req)
      const existing = await AssignmentGroup.findById(req.params["id"]).lean()
      if (!existing) return res.status(404).json({ message: "Group not found" })
      const course = await Course.findById(existing.courseId).lean()
      if (!course || String(course.instructorId) !== userId)
        return res.status(403).json({ message: "Forbidden" })
      const group = await assignmentGroupService.update(req.params["id"] as string, parsed.data)
      res.json(group)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequesterId(req)
      const existing = await AssignmentGroup.findById(req.params["id"]).lean()
      if (!existing) return res.status(404).json({ message: "Group not found" })
      const course = await Course.findById(existing.courseId).lean()
      if (!course || String(course.instructorId) !== userId)
        return res.status(403).json({ message: "Forbidden" })
      await assignmentGroupService.delete(req.params["id"] as string)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
