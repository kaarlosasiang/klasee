import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { announcementController } from "./announcementController.js"

const router: IRouter = Router()

router.get("/", requireAuth, announcementController.list)
router.post("/", requireAuth, requireRole("instructor", "admin"), announcementController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), announcementController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), announcementController.remove)

export default router
