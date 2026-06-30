import { Router } from "express"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { usersController } from "./usersController.js"

const router = Router()

router.get("/me", requireAuth, usersController.getMe)
router.patch("/me", requireAuth, usersController.updateMe)
router.delete("/me", requireAuth, usersController.deleteMe)
router.patch("/me/onboarding", requireAuth, usersController.completeOnboarding)

export default router
