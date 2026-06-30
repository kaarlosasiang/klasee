import { NextFunction, Request, Response } from "express"
import { getRelevantTip } from "./tipService.js"

export const tipController = {
  async getRelevant(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = (req.authUser as any)?.id as string
      const tip = await getRelevantTip(instructorId)
      if (!tip) return res.status(204).send()
      res.json(tip)
    } catch (err) {
      next(err)
    }
  },
}
