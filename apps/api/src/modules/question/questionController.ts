import { NextFunction, Request, Response } from "express"
import { questionService } from "./questionService.js"
import { Question } from "../../models/questionModel.js"
import { Assessment } from "../../models/assessmentModel.js"
import { Course } from "../../models/courseModel.js"
import { ItemBank } from "../../models/itemBankModel.js"

function getRequesterId(req: Request): string {
  return String((req.authUser as any)?.id)
}

async function verifyAssessmentOwnership(assessmentId: string, requesterId: string): Promise<boolean> {
  const assessment = await Assessment.findById(assessmentId).lean()
  if (!assessment) return false
  const course = await Course.findById(assessment.courseId).lean()
  return !!course && String(course.instructorId) === requesterId
}

async function verifyBankOwnership(itemBankId: string, requesterId: string): Promise<boolean> {
  const bank = await ItemBank.findById(itemBankId).lean()
  if (!bank) return false
  return String(bank.instructorId) === requesterId
}

export const questionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId, itemBankId, ids } = req.query as {
        assessmentId?: string
        itemBankId?: string
        ids?: string
      }

      if (ids) {
        const idList = ids.split(",").filter(Boolean)
        const questions = await questionService.findByIds(idList)
        return res.json(questions)
      }

      if (itemBankId) {
        const questions = await questionService.findByBank(itemBankId)
        return res.json(questions)
      }

      if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId, itemBankId, or ids query param is required" })
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
      res.json(question)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        assessmentId,
        itemBankId,
        type,
        question,
        points,
        order,
        options,
        correctAnswer,
        required,
        multipleAnswers,
        randomizeOrder,
        estimationTime,
      } = req.body as {
        assessmentId?: string
        itemBankId?: string
        type: "multiple_choice" | "true_false" | "essay" | "fill_in"
        question: string
        points?: number
        order?: number
        options?: { text: string; isCorrect?: boolean }[]
        correctAnswer?: string | boolean
        required?: boolean
        multipleAnswers?: boolean
        randomizeOrder?: boolean
        estimationTime?: number
      }

      if (!type || !question?.trim()) {
        return res.status(400).json({ message: "type and question are required" })
      }
      if (!assessmentId && !itemBankId) {
        return res.status(400).json({ message: "assessmentId or itemBankId is required" })
      }

      const requesterId = getRequesterId(req)

      if (assessmentId) {
        if (!(await verifyAssessmentOwnership(assessmentId, requesterId))) {
          return res.status(403).json({ message: "Forbidden" })
        }
        const created = await questionService.create({
          assessmentId,
          type,
          question: question.trim(),
          points,
          order,
          options,
          correctAnswer,
        })
        return res.status(201).json(created)
      }

      if (!(await verifyBankOwnership(itemBankId!, requesterId))) {
        return res.status(403).json({ message: "Forbidden" })
      }
      const created = await questionService.create({
        itemBankId,
        type,
        question: question.trim(),
        points,
        order,
        options,
        correctAnswer,
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

      const requesterId = getRequesterId(req)
      const allowed = existing.assessmentId
        ? await verifyAssessmentOwnership(String(existing.assessmentId), requesterId)
        : existing.itemBankId
          ? await verifyBankOwnership(String(existing.itemBankId), requesterId)
          : false

      if (!allowed) return res.status(403).json({ message: "Forbidden" })

      const question = await questionService.update(id, req.body)
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

      const requesterId = getRequesterId(req)
      const allowed = existing.assessmentId
        ? await verifyAssessmentOwnership(String(existing.assessmentId), requesterId)
        : existing.itemBankId
          ? await verifyBankOwnership(String(existing.itemBankId), requesterId)
          : false

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
      if (!(await verifyAssessmentOwnership(assessmentId, getRequesterId(req)))) {
        return res.status(403).json({ message: "Forbidden" })
      }
      await questionService.reorder(assessmentId, questionIds)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  },
}
