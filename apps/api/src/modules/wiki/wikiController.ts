import { NextFunction, Request, Response } from "express"
import { wikiService } from "./wikiService.js"

export const wikiController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = req.params.id as string
      const wiki = await wikiService.findByCourse(courseId)
      res.json(wiki ?? { content: "", courseId })
    } catch (err) {
      next(err)
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = req.params.id as string
      const userId = (req.authUser as any)?.id as string
      const { content } = req.body as { content: string }
      const wiki = await wikiService.upsert(courseId, content ?? "", userId)
      res.json(wiki)
    } catch (err) {
      next(err)
    }
  },
}
