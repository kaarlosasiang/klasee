import { Router, type IRouter } from "express"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { announcementController } from "./announcementController.js"

const router: IRouter = Router()

router.get("/", requireAuth, announcementController.list)
router.post("/", requireAuth, announcementController.create)
router.put("/:id", requireAuth, announcementController.update)
router.delete("/:id", requireAuth, announcementController.remove)

export default router
