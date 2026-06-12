import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { requireCourseOwner } from "../../shared/middleware/course.middleware.js"
import { wikiController } from "./wikiController.js"

const router: IRouter = Router()

router.get("/:id", requireAuth, wikiController.get)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), requireCourseOwner, wikiController.upsert)

export default router
