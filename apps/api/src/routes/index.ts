import { toNodeHandler } from "better-auth/node"
import { Application } from "express"

import { auth } from "../modules/auth/better-auth.js"
import announcementRoutes from "../modules/announcement/announcementRoutes.js"
import assessmentRoutes from "../modules/assessment/assessmentRoutes.js"
import assignmentGroupRoutes from "../modules/assignment-group/assignmentGroupRoutes.js"
import assignmentSubmissionRoutes from "../modules/assignment-submission/assignmentSubmissionRoutes.js"
import attendanceRoutes from "../modules/attendance/attendanceRoutes.js"
import courseRoutes from "../modules/course/courseRoutes.js"
import driveRoutes from "../modules/drive/driveRoutes.js"
import dueDateOverrideRoutes from "../modules/due-date-override/dueDateOverrideRoutes.js"
import enrollmentRoutes from "../modules/enrollment/enrollmentRoutes.js"
import gradebookRoutes from "../modules/gradebook/gradebookRoutes.js"
import invitationRoutes from "../modules/invitation/invitationRoutes.js"
import lessonRoutes from "../modules/lesson/lessonRoutes.js"
import moduleRoutes from "../modules/module/moduleRoutes.js"
import questionRoutes from "../modules/question/questionRoutes.js"
import quizAttemptRoutes from "../modules/quiz-attempt/quizAttemptRoutes.js"
import sectionRoutes from "../modules/section/sectionRoutes.js"
import studentRoutes from "../modules/student/studentRoutes.js"
import wikiRoutes from "../modules/wiki/wikiRoutes.js"
import todosRoutes from "../modules/todos/todosRoutes.js"
import usersRoutes from "../modules/users/usersRoutes.js"

export default (app: Application): void => {
  const API_PREFIX = "/api/v1"

  app.all(/^\/api\/auth(?:\/.*)?$/, toNodeHandler(auth))

  // API routes
  app.use(`${API_PREFIX}/announcements`, announcementRoutes)
  app.use(`${API_PREFIX}/modules`, moduleRoutes)
  app.use(`${API_PREFIX}/courses`, courseRoutes)
  app.use(`${API_PREFIX}/drive`, driveRoutes)
  app.use(`${API_PREFIX}/due-date-overrides`, dueDateOverrideRoutes)
  app.use(`${API_PREFIX}/sections`, sectionRoutes)
  app.use(`${API_PREFIX}/enrollments`, enrollmentRoutes)
  app.use(`${API_PREFIX}/invitations`, invitationRoutes)
  app.use(`${API_PREFIX}/attendance`, attendanceRoutes)
  app.use(`${API_PREFIX}/assessments`, assessmentRoutes)
  app.use(`${API_PREFIX}/assignment-groups`, assignmentGroupRoutes)
  app.use(`${API_PREFIX}/assignment-submissions`, assignmentSubmissionRoutes)
  app.use(`${API_PREFIX}/gradebook`, gradebookRoutes)
  app.use(`${API_PREFIX}/lessons`, lessonRoutes)
  app.use(`${API_PREFIX}/questions`, questionRoutes)
  app.use(`${API_PREFIX}/quiz-attempts`, quizAttemptRoutes)
  app.use(`${API_PREFIX}/students`, studentRoutes)
  app.use(`${API_PREFIX}/wiki`, wikiRoutes)
  app.use(`${API_PREFIX}/todos`, todosRoutes)
  app.use(`${API_PREFIX}/users`, usersRoutes)
}
