import { NextFunction, Request, Response } from "express"
import { questionService } from "./questionService.js"
import { Question } from "../../models/questionModel.js"
import { Assessment } from "../../models/assessmentModel.js"
import { Enrollment } from "../../models/enrollmentModel.js"
import { verifyAssessmentOwnership } from "../../shared/utils/ownership.js"
import { getUserId } from "../../shared/utils/request.js"
import { createQuestionSchema, updateQuestionSchema } from "@workspace/validators"

export const questionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId, ids } = req.query as {
        assessmentId?: string
        ids?: string
      }

      if (ids) {
        const idList = ids.split(",").filter(Boolean)
        const questions = await questionService.findByIds(idList)
        return res.json(questions)
      }

      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId or ids query param is required" })
      }
      const questions = await questionService.findByAssessment(assessmentId)
      res.json(questions)
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await questionService.findById(req.params["id"] as string)
      if (!question) return res.status(404).json({ message: "Question not found" })

      const role = (req.authUser as any)?.role
      if (role === "student") {
        if (question.assessmentId) {
          const assessment = await Assessment.findById(question.assessmentId).lean()
          if (!assessment) return res.status(404).json({ message: "Question not found" })
          const enrollment = await Enrollment.findOne({
            studentId: getUserId(req),
            courseId: assessment.courseId,
            status: "active",
          }).lean()
          if (!enrollment) return res.status(403).json({ message: "Forbidden" })
        }
      }

      res.json(question)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createQuestionSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }

      if (!parsed.data.assessmentId) {
        return res.status(400).json({ message: "assessmentId is required" })
      }

      const requesterId = getUserId(req)

      if (!(await verifyAssessmentOwnership(parsed.data.assessmentId, requesterId))) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const created = await questionService.create({
        assessmentId: parsed.data.assessmentId,
        type: parsed.data.type,
        question: parsed.data.question.trim(),
        points: parsed.data.points,
        order: parsed.data.order,
        options: parsed.data.options,
        correctAnswer: parsed.data.correctAnswer,
        required: parsed.data.required,
        multipleAnswers: parsed.data.multipleAnswers,
        randomizeOrder: parsed.data.randomizeOrder,
        estimationTime: parsed.data.estimationTime,
      })
      res.status(201).json(created)
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await Question.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Question not found" })

      const parsed = updateQuestionSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }

      const requesterId = getUserId(req)
      if (!existing.assessmentId) return res.status(403).json({ message: "Forbidden" })
      const allowed = await verifyAssessmentOwnership(String(existing.assessmentId), requesterId)
      if (!allowed) return res.status(403).json({ message: "Forbidden" })

      const question = await questionService.update(id, parsed.data)
      res.json(question)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await Question.findById(id).lean()
      if (!existing) return res.status(404).json({ message: "Question not found" })

      const requesterId = getUserId(req)
      if (!existing.assessmentId) return res.status(403).json({ message: "Forbidden" })
      const allowed = await verifyAssessmentOwnership(String(existing.assessmentId), requesterId)
      if (!allowed) return res.status(403).json({ message: "Forbidden" })

      await questionService.delete(id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query as { assessmentId?: string }
      const { questionIds } = req.body as { questionIds: string[] }
      if (!assessmentId || !questionIds?.length) {
        return res.status(400).json({ message: "assessmentId and questionIds are required" })
      }
      if (!(await verifyAssessmentOwnership(assessmentId, getUserId(req)))) {
        return res.status(403).json({ message: "Forbidden" })
      }
      await questionService.reorder(assessmentId, questionIds)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  },
}
