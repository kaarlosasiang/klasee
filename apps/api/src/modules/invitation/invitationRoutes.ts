import { Router, type IRouter } from "express"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { invitationController } from "./invitationController.js"

const router: IRouter = Router()

router.post("/", requireAuth, invitationController.create)
router.get("/", requireAuth, invitationController.list)
router.delete("/:id", requireAuth, invitationController.revoke)
router.get("/verify", invitationController.verify)
router.post("/accept", requireAuth, invitationController.accept)

export default router
