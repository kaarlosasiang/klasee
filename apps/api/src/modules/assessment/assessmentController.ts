import { NextFunction, Request, Response } from "express"
import { assessmentService } from "./assessmentService.js"
import { Assessment } from "../../models/assessmentModel.js"
import { AssessmentScore } from "../../models/assessmentScore.js"
import { Course } from "../../models/courseModel.js"
import {
  createAssessmentSchema,
  updateAssessmentSchema,
} from "@workspace/validators"
import { verifyAssessmentOwnership } from "../../shared/utils/ownership.js"
import { getUserId } from "../../shared/utils/request.js"

export const assessmentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const { courseId } = req.query
      const filter: Record<string, unknown> = {}
      if (courseId) filter.courseId = courseId
      if (role !== "instructor" && role !== "admin") {
        filter.isPublished = true
      }
      const studentId = role === "student" ? getUserId(req) : undefined
      const assessments = await assessmentService.findAll(filter, studentId)
      res.json(assessments)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const assessment = await assessmentService.findById(req.params['id'] as string)
      if (!assessment) return res.status(404).json({ message: "Assessment not found" })
      if (role !== "instructor" && role !== "admin" && !assessment.isPublished) {
        return res.status(403).json({ message: "Forbidden" })
      }
      res.json(assessment)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createAssessmentSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const userId = getUserId(req)
      const course = await Course.findById(parsed.data.courseId).lean()
      if (!course) return res.status(404).json({ message: "Course not found" })
      if (String(course.instructorId) !== userId) {
        return res.status(403).json({ message: "Forbidden" })
      }

      const assessment = await assessmentService.create(parsed.data)
      res.status(201).json(assessment)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateAssessmentSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const userId = getUserId(req)
      const existing = await Assessment.findById(req.params["id"] as string).lean()
      if (!existing) return res.status(404).json({ message: "Assessment not found" })
      const course = await Course.findById(existing.courseId).lean()
      if (!course || String(course.instructorId) !== userId) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const assessment = await assessmentService.update(req.params['id'] as string, parsed.data)
      res.json(assessment)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req)
      const existing = await Assessment.findById(req.params["id"] as string).lean()
      if (!existing) return res.status(404).json({ message: "Assessment not found" })
      const course = await Course.findById(existing.courseId).lean()
      if (!course || String(course.instructorId) !== userId) {
        return res.status(403).json({ message: "Forbidden" })
      }
      await assessmentService.delete(req.params['id'] as string)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async listScores(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.authUser as any)?.role
      const { assessmentId, studentId } = req.query
      const filter: Record<string, unknown> = {}
      if (assessmentId) filter.assessmentId = assessmentId

      if (role === "student") {
        filter.studentId = getUserId(req)
      } else if (studentId) {
        filter.studentId = studentId
      }

      const scores = await assessmentService.findScores(filter)
      res.json(scores)
    } catch (err) {
      next(err)
    }
  },

  async createScore(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.body as { assessmentId?: string }
      if (!assessmentId) return res.status(400).json({ message: "assessmentId is required" })
      const owned = await verifyAssessmentOwnership(assessmentId, getUserId(req))
      if (!owned) return res.status(403).json({ message: "Forbidden" })
      const score = await assessmentService.createScore(req.body)
      res.status(201).json(score)
    } catch (err) {
      next(err)
    }
  },

  async updateScore(req: Request, res: Response, next: NextFunction) {
    try {
      const existingScore = await AssessmentScore.findById(req.params["id"] as string).lean()
      if (!existingScore) return res.status(404).json({ message: "Score not found" })
      const owned = await verifyAssessmentOwnership(String(existingScore.assessmentId), getUserId(req))
      if (!owned) return res.status(403).json({ message: "Forbidden" })
      const score = await assessmentService.updateScore(req.params['id'] as string, req.body)
      if (!score) return res.status(404).json({ message: "Score not found" })
      res.json(score)
    } catch (err) {
      next(err)
    }
  },
}
