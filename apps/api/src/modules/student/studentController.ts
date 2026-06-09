import { NextFunction, Request, Response } from "express"
import { studentService } from "./studentService.js"

export const studentController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String((req.authUser as any)?._id ?? (req.authUser as any)?.id)
      const profile = await studentService.getProfile(userId)
      res.json(profile)
    } catch (err) {
      next(err)
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String((req.authUser as any)?._id ?? (req.authUser as any)?.id)
      const { yearLevel, program, guardianName, guardianContact } = req.body as {
        yearLevel?: unknown
        program?: string
        guardianName?: string
        guardianContact?: string
      }

      if (yearLevel !== undefined) {
        const n = Number(yearLevel)
        if (!Number.isInteger(n) || n < 1 || n > 6) {
          return res.status(400).json({ message: "yearLevel must be between 1 and 6" })
        }
      }

      await studentService.upsertAcademicInfo(userId, {
        yearLevel: yearLevel !== undefined ? Number(yearLevel) : undefined,
        program,
        guardianName,
        guardianContact,
      })
      res.json({ message: "Profile updated" })
    } catch (err) {
      next(err)
    }
  },
}
