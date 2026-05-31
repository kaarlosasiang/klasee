import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { assessmentController } from "./assessmentController.js"

const router: IRouter = Router()

// Scores — must be registered before /:id so "scores" isn't matched as an id param
router.get("/scores", requireAuth, assessmentController.listScores)
router.post("/scores", requireAuth, requireRole("instructor", "admin"), assessmentController.createScore)
router.put("/scores/upsert", requireAuth, requireRole("instructor", "admin"), assessmentController.upsertScore)
router.put("/scores/:id", requireAuth, requireRole("instructor", "admin"), assessmentController.updateScore)

// Assessments
router.get("/", requireAuth, assessmentController.list)
router.get("/:id", requireAuth, assessmentController.getById)
router.post("/", requireAuth, requireRole("instructor", "admin"), assessmentController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), assessmentController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), assessmentController.remove)

export default router
