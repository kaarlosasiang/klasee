import { NextFunction, Request, Response } from "express"
import { Course } from "../../models/courseModel.js"
import { AuthorizationError } from "../error-types/authorization.error.js"
import { NotFoundError } from "../error-types/not-found.error.js"

export const requireCourseOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const role = (req.authUser as any)?.role as string | undefined
    if (role === "admin") return next()

    const course = await Course.findById(req.params["id"] as string)
      .select("instructorId")
      .lean()

    if (!course) {
      return next(new NotFoundError("Course not found"))
    }

    if (role === "instructor") {
      const userId = (req.authUser as any)?.id as string | undefined
      if (String(course.instructorId) !== userId) {
        return next(new AuthorizationError("You do not own this course"))
      }
    }

    next()
  } catch (err) {
    next(err)
  }
}
