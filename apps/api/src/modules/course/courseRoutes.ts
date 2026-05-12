import { Router, type IRouter } from "express"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { requireRole } from "../../shared/middleware/auth.middleware.js"
import { courseController } from "./courseController.js"

const router: IRouter = Router()

router.get("/", requireAuth, courseController.list)
router.get("/archived", requireAuth, courseController.listArchived)
router.get("/:id", requireAuth, courseController.getById)
router.post("/", requireAuth, requireRole("instructor", "admin"), courseController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), courseController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), courseController.remove)
router.patch("/:id/archive", requireAuth, requireRole("instructor", "admin"), courseController.archive)
router.patch("/:id/unarchive", requireAuth, requireRole("instructor", "admin"), courseController.unarchive)

export default router
