import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { assessmentController } from "./assessmentController.js"

const router: IRouter = Router()

// Assessments
router.get("/", requireAuth, assessmentController.list)
router.get("/:id", requireAuth, assessmentController.getById)
router.post("/", requireAuth, requireRole("instructor", "admin"), assessmentController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), assessmentController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), assessmentController.remove)

// Scores
router.get("/scores", requireAuth, assessmentController.listScores)
router.post("/scores", requireAuth, requireRole("instructor", "admin"), assessmentController.createScore)
router.put("/scores/:id", requireAuth, requireRole("instructor", "admin"), assessmentController.updateScore)

export default router
