import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { quizAttemptController } from "./quizAttemptController.js"

const router: IRouter = Router()

router.get("/", requireAuth, requireRole("instructor", "admin"), quizAttemptController.list)
router.get("/my", requireAuth, quizAttemptController.myAttempts)
router.get("/:id", requireAuth, quizAttemptController.getById)
router.post("/start", requireAuth, quizAttemptController.start)
router.post("/:id/submit", requireAuth, quizAttemptController.submit)

export default router
