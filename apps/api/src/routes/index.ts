import { toNodeHandler } from "better-auth/node"
import { Application } from "express"

import { auth } from "../modules/auth/better-auth.js"
import announcementRoutes from "../modules/announcement/announcementRoutes.js"
import assessmentRoutes from "../modules/assessment/assessmentRoutes.js"
import attendanceRoutes from "../modules/attendance/attendanceRoutes.js"
import courseRoutes from "../modules/course/courseRoutes.js"
import driveRoutes from "../modules/drive/driveRoutes.js"
import enrollmentRoutes from "../modules/enrollment/enrollmentRoutes.js"
import invitationRoutes from "../modules/invitation/invitationRoutes.js"
import moduleRoutes from "../modules/module/moduleRoutes.js"
import sectionRoutes from "../modules/section/sectionRoutes.js"

export default (app: Application): void => {
  const API_PREFIX = "/api/v1"

  app.all(`/api/auth/*splat`, toNodeHandler(auth))

  // API routes
  app.use(`${API_PREFIX}/announcements`, announcementRoutes)
  app.use(`${API_PREFIX}/modules`, moduleRoutes)
  app.use(`${API_PREFIX}/courses`, courseRoutes)
  app.use(`${API_PREFIX}/drive`, driveRoutes)
  app.use(`${API_PREFIX}/sections`, sectionRoutes)
  app.use(`${API_PREFIX}/enrollments`, enrollmentRoutes)
  app.use(`${API_PREFIX}/invitations`, invitationRoutes)
  app.use(`${API_PREFIX}/attendance`, attendanceRoutes)
  app.use(`${API_PREFIX}/assessments`, assessmentRoutes)
}
