import { NextFunction, Request, Response } from "express"
import { invitationService } from "./invitationService.js"

function getUserId(req: Request): string {
  return String((req.authUser as any)?._id ?? (req.authUser as any)?.id)
}

export const invitationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req)
      const { courseId, sectionId, expiresInDays } = req.body as {
        courseId: string
        sectionId: string
        expiresInDays?: number | null
      }

      const invitation = await invitationService.create({
        courseId,
        sectionId,
        createdBy: userId,
        expiresInDays: expiresInDays ?? 7,
      })

      res.status(201).json(invitation)
    } catch (err) {
      next(err)
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query as { courseId?: string }
      if (!courseId) {
        res.status(400).json({ message: "courseId is required" })
        return
      }
      const invitations = await invitationService.findByCourse(courseId)
      res.json(invitations)
    } catch (err) {
      next(err)
    }
  },

  async revoke(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string }
      const invitation = await invitationService.revoke(id)
      res.json(invitation)
    } catch (err) {
      next(err)
    }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token?: string }
      if (!token) {
        res.status(400).json({ message: "token is required" })
        return
      }
      const result = await invitationService.verify(token)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = getUserId(req)
      const { token } = req.body as { token?: string }
      if (!token) {
        res.status(400).json({ message: "token is required" })
        return
      }
      const enrollment = await invitationService.accept(token, studentId)
      res.status(201).json(enrollment)
    } catch (err: any) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message })
      }
      if (err.code === 11000) {
        return res
          .status(409)
          .json({ message: "Already enrolled in this section" })
      }
      next(err)
    }
  },
}
