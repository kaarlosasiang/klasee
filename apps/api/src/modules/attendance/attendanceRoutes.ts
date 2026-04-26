import { Router } from "express"
import type { Router as ExpressRouter } from "express"
import {
  requireAuth,
  requireRole,
} from "../../shared/middleware/auth.middleware.js"
import { attendanceController } from "./attendanceController.js"

const router: ExpressRouter = Router()

router.get("/", requireAuth, attendanceController.list)
router.post(
  "/",
  requireAuth,
  requireRole("instructor", "admin"),
  attendanceController.create
)
router.put(
  "/:id",
  requireAuth,
  requireRole("instructor", "admin"),
  attendanceController.update
)

export default router
