import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { sectionController } from "./sectionController.js"

const router: IRouter = Router()

router.get("/", requireAuth, sectionController.list)
router.get("/:id", requireAuth, sectionController.getById)
router.post("/", requireAuth, requireRole("instructor", "admin"), sectionController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), sectionController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), sectionController.remove)

export default router
