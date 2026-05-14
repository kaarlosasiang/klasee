import { Router, type IRouter } from "express"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { moduleController } from "./moduleController.js"

const router: IRouter = Router()

router.get("/", requireAuth, moduleController.list)
router.post("/", requireAuth, moduleController.create)
router.put("/:id", requireAuth, moduleController.update)
router.delete("/:id", requireAuth, moduleController.remove)
router.patch("/reorder", requireAuth, moduleController.reorder)

export default router
