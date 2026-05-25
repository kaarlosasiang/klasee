import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { assignmentGroupController } from "./assignmentGroupController.js"

const router: IRouter = Router()

router.get("/", requireAuth, assignmentGroupController.list)
router.post("/", requireAuth, requireRole("instructor", "admin"), assignmentGroupController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), assignmentGroupController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), assignmentGroupController.remove)

export default router
