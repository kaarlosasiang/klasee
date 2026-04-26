import { toNodeHandler } from "better-auth/node"
import { Application } from "express"

import { auth } from "../modules/auth/better-auth.js"
import assessmentRoutes from "../modules/assessment/assessmentRoutes.js"
import attendanceRoutes from "../modules/attendance/attendanceRoutes.js"
import courseRoutes from "../modules/course/courseRoutes.js"
import enrollmentRoutes from "../modules/enrollment/enrollmentRoutes.js"
import sectionRoutes from "../modules/section/sectionRoutes.js"

export default (app: Application): void => {
  const API_PREFIX = "/api/v1"

  app.all(`${API_PREFIX}/auth/*splat`, toNodeHandler(auth))

  // API routes
  app.use(`${API_PREFIX}/courses`, courseRoutes)
  app.use(`${API_PREFIX}/sections`, sectionRoutes)
  app.use(`${API_PREFIX}/enrollments`, enrollmentRoutes)
  app.use(`${API_PREFIX}/attendance`, attendanceRoutes)
  app.use(`${API_PREFIX}/assessments`, assessmentRoutes)
}
