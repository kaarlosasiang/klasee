import { Router } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { itemBankController } from "./itemBankController.js"

const router = Router()

router.get("/", requireAuth, itemBankController.list)
router.post("/", requireAuth, requireRole("instructor", "admin"), itemBankController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), itemBankController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), itemBankController.remove)

export default router
