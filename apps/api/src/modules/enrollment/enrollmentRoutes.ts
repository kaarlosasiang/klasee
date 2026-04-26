import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { enrollmentController } from "./enrollmentController.js"

const router: IRouter = Router()

router.get("/", requireAuth, enrollmentController.list)
router.post("/", requireAuth, requireRole("instructor", "admin"), enrollmentController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), enrollmentController.update)

export default router
