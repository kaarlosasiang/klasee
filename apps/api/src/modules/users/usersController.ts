import { NextFunction, Request, Response } from "express"
import { User } from "../../models/userModel.js"

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
      const { firstName, lastName, phoneNumber } = req.body as {
        firstName?: string
        lastName?: string
        phoneNumber?: string
      }

      const update: Record<string, unknown> = {}
      if (firstName) update.firstName = firstName.trim()
      if (lastName) update.lastName = lastName.trim()
      if (phoneNumber) update.phoneNumber = phoneNumber.trim()

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
      const { firstName, lastName, phoneNumber } = req.body as {
        firstName?: string
        lastName?: string
        phoneNumber?: string
      }

      const update: Record<string, unknown> = { onboardingCompleted: true }
      if (firstName) update.firstName = firstName.trim()
      if (lastName) update.lastName = lastName.trim()
      if (phoneNumber) update.phoneNumber = phoneNumber.trim()

      const user = await User.findByIdAndUpdate(userId, update, { new: true })
        .select("_id firstName lastName phoneNumber onboardingCompleted")
        .lean()

      if (!user) return res.status(404).json({ message: "User not found" })
      res.json(user)
    } catch (err) {
      next(err)
    }
  },
}
