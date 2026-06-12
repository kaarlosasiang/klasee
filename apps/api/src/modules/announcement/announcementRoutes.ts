import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { validate } from "../../shared/middleware/validate.middleware.js"
import { createAnnouncementSchema, updateAnnouncementSchema } from "@workspace/validators"
import { announcementController } from "./announcementController.js"

const router: IRouter = Router()

router.get("/", requireAuth, announcementController.list)
router.post("/", requireAuth, requireRole("instructor", "admin"), validate(createAnnouncementSchema), announcementController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), validate(updateAnnouncementSchema), announcementController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), announcementController.remove)

export default router
