import { Router } from "express"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { usersController } from "./usersController.js"

const router = Router()

router.patch("/me/onboarding", requireAuth, usersController.completeOnboarding)

export default router
