import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { tipController } from "./tipController.js"

const router: IRouter = Router()

router.get("/relevant", requireAuth, requireRole("instructor", "admin"), tipController.getRelevant)

export default router
