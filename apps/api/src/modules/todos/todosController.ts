import { NextFunction, Request, Response } from "express"
import { getInstructorTodos } from "./todosService.js"

export const todosController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = (req.authUser as any)?.id as string
      const data = await getInstructorTodos(instructorId)
      res.json(data)
    } catch (err) {
      next(err)
    }
  },
}
