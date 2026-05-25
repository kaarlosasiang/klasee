import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { gradebookController } from "./gradebookController.js"

const router: IRouter = Router()

// Must be registered before /:anything routes — "my" would otherwise match an id param
router.get("/my", requireAuth, gradebookController.getMy)
router.get("/", requireAuth, requireRole("instructor", "admin"), gradebookController.getCourse)

export default router
