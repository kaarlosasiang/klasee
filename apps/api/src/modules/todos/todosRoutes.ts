import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { todosController } from "./todosController.js"

const router: IRouter = Router()

router.get("/", requireAuth, requireRole("instructor", "admin"), todosController.get)

export default router
