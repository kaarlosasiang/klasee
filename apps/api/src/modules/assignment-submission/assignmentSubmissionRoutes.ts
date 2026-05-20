import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { assignmentSubmissionController } from "./assignmentSubmissionController.js"

const router: IRouter = Router()

router.get("/", requireAuth, requireRole("instructor", "admin"), assignmentSubmissionController.list)
router.get("/my", requireAuth, assignmentSubmissionController.mySubmission)
router.get("/:id", requireAuth, assignmentSubmissionController.getById)
router.post("/submit", requireAuth, assignmentSubmissionController.submit)
router.put("/:id/grade", requireAuth, requireRole("instructor", "admin"), assignmentSubmissionController.grade)

export default router
