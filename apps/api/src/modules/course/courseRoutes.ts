import { Router, type IRouter } from "express"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { requireRole } from "../../shared/middleware/auth.middleware.js"
import { courseController } from "./courseController.js"

const router: IRouter = Router()

router.get("/", requireAuth, courseController.list)
router.get("/:id", requireAuth, courseController.getById)
router.post("/", requireAuth, requireRole("instructor", "admin"), courseController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), courseController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), courseController.remove)

export default router
