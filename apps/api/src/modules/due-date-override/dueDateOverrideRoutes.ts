import { Router } from "express"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { requireRole } from "../../shared/middleware/auth.middleware.js"
import { dueDateOverrideController } from "./dueDateOverrideController.js"

const router = Router()

router.get("/", requireAuth, requireRole("instructor", "admin"), dueDateOverrideController.list)
router.post("/", requireAuth, requireRole("instructor", "admin"), dueDateOverrideController.upsert)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), dueDateOverrideController.remove)

export default router
