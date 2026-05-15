import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { moduleController } from "./moduleController.js"

const router: IRouter = Router()

router.get("/", requireAuth, moduleController.list)
router.post("/", requireAuth, requireRole("instructor", "admin"), moduleController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), moduleController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), moduleController.remove)
router.patch("/reorder", requireAuth, requireRole("instructor", "admin"), moduleController.reorder)

export default router
