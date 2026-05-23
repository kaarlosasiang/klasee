import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { attendanceService } from "./attendanceService.js"
import { Attendance } from "../../models/attendanceModel.js"
import {
  createAttendanceSchema,
  updateAttendanceSchema,
  bulkAttendanceSchema,
} from "@workspace/validators"

function getRequesterId(req: Request): string {
  return String((req.authUser as any)?._id ?? (req.authUser as any)?.id)
}

function getRequesterRole(req: Request): string {
  return String((req.authUser as any)?.role ?? "")
}

export const attendanceController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const role = getRequesterRole(req)
      const requesterId = getRequesterId(req)
      const { courseId, sectionId, studentId, date } = req.query as Record<
        string,
        string | undefined
      >

      const filter: Record<string, unknown> = {}

      if (role === "student") {
        filter.studentId = requesterId
      } else {
        if (courseId) filter.courseId = courseId
        if (sectionId) filter.sectionId = sectionId
        if (studentId) filter.studentId = studentId
      }
      if (date) filter.date = date

      const records = await attendanceService.findAll(filter)
      res.json(records)
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createAttendanceSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const { studentId, sectionId, courseId, date, status } = parsed.data
      const record = await attendanceService.upsert(
        studentId,
        sectionId,
        courseId,
        date,
        status
      )
      res.status(201).json(record)
    } catch (err) {
      next(err)
    }
  },

  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = bulkAttendanceSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const { records } = parsed.data
      const ObjectId = mongoose.Types.ObjectId
      const ops = records.map((r) => ({
        updateOne: {
          filter: { studentId: new ObjectId(r.studentId), sectionId: new ObjectId(r.sectionId), date: r.date },
          update: { $set: { courseId: new ObjectId(r.courseId), status: r.status } },
          upsert: true,
        },
      }))
      const result = await Attendance.bulkWrite(ops)
      res.json({
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
      })
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateAttendanceSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        })
      }
      const id = req.params["id"] as string
      const existing = await Attendance.findById(id).lean()
      if (!existing) {
        return res.status(404).json({ message: "Record not found" })
      }
      const record = await attendanceService.update(id, parsed.data)
      res.json(record)
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string
      const existing = await Attendance.findById(id).lean()
      if (!existing) {
        return res.status(404).json({ message: "Record not found" })
      }
      await attendanceService.delete(id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async myAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = getRequesterId(req)
      const { courseId, sectionId } = req.query as Record<
        string,
        string | undefined
      >
      const filter: Record<string, unknown> = {}
      if (courseId) filter.courseId = courseId
      if (sectionId) filter.sectionId = sectionId
      const records = await attendanceService.findByStudent(studentId, filter)
      res.json(records)
    } catch (err) {
      next(err)
    }
  },
}
