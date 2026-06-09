import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { studentController } from "./studentController.js"

const router: IRouter = Router()

router.get("/me", requireAuth, requireRole("student"), studentController.getMe)
router.patch("/me", requireAuth, requireRole("student"), studentController.updateMe)

export default router
