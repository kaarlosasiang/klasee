import { NextFunction, Request, Response } from "express"
import { User } from "../../models/userModel.js"
import { Student } from "../../models/studentModel.js"
import { Enrollment } from "../../models/enrollmentModel.js"
import { QuizAttempt } from "../../models/quizAttemptModel.js"
import { AssignmentSubmission } from "../../models/assignmentSubmissionModel.js"
import { AssessmentScore } from "../../models/assessmentScore.js"
import { Attendance } from "../../models/attendanceModel.js"
import { CourseAudit } from "../../models/courseAuditModel.js"
import { Course } from "../../models/courseModel.js"

export const usersController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.authUser as any)?.id
      const user = await User.findById(userId)
        .select("_id firstName lastName email phoneNumber role username schoolId image")
        .lean()
      if (!user) return res.status(404).json({ message: "User not found" })
      res.json(user)
    } catch (err) {
      next(err)
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.authUser as any)?.id
      const { firstName, lastName, phoneNumber, consentGivenAt } = req.body as {
        firstName?: string
        lastName?: string
        phoneNumber?: string
        consentGivenAt?: number
      }

      const update: Record<string, unknown> = {}
      if (firstName) update.firstName = firstName.trim()
      if (lastName) update.lastName = lastName.trim()
      if (phoneNumber) update.phoneNumber = phoneNumber.trim()
      if (consentGivenAt) update.consentGivenAt = consentGivenAt

      const user = await User.findByIdAndUpdate(userId, update, { new: true })
        .select("_id firstName lastName phoneNumber")
        .lean()
      if (!user) return res.status(404).json({ message: "User not found" })
      res.json(user)
    } catch (err) {
      next(err)
    }
  },

  async completeOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.authUser as any)?.id
      const { firstName, lastName, phoneNumber, consentGivenAt } = req.body as {
        firstName?: string
        lastName?: string
        phoneNumber?: string
        consentGivenAt?: number
      }

      const update: Record<string, unknown> = { onboardingCompleted: true }
      if (firstName) update.firstName = firstName.trim()
      if (lastName) update.lastName = lastName.trim()
      if (phoneNumber) update.phoneNumber = phoneNumber.trim()
      if (consentGivenAt) update.consentGivenAt = consentGivenAt

      const user = await User.findByIdAndUpdate(userId, update, { new: true })
        .select("_id firstName lastName phoneNumber onboardingCompleted")
        .lean()

      if (!user) return res.status(404).json({ message: "User not found" })
      res.json(user)
    } catch (err) {
      next(err)
    }
  },

  async deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.authUser as any)?.id
      const user = await User.findById(userId).lean()
      if (!user) return res.status(404).json({ message: "User not found" })

      const role = (user as any).role as string

      await Promise.all([
        Student.deleteOne({ userId }),
        Enrollment.deleteMany({ studentId: userId }),
        QuizAttempt.deleteMany({ userId }),
        AssignmentSubmission.deleteMany({ userId }),
        AssessmentScore.deleteMany({ studentId: userId }),
        Attendance.deleteMany({ studentId: userId }),
        CourseAudit.deleteMany({ userId }),
      ])

      if (role === "instructor" || role === "admin") {
        await Course.updateMany({ instructorId: userId }, { isArchived: true })
      }

      await User.deleteOne({ _id: userId })

      res.json({ message: "Account deleted" })
    } catch (err) {
      next(err)
    }
  },
}
