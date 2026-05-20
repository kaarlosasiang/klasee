import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { lessonController } from "./lessonController.js"

const router: IRouter = Router()

router.get("/", requireAuth, lessonController.list)
router.get("/:id", requireAuth, lessonController.getById)
router.post("/", requireAuth, requireRole("instructor", "admin"), lessonController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), lessonController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), lessonController.remove)
router.patch("/reorder", requireAuth, requireRole("instructor", "admin"), lessonController.reorder)

export default router
