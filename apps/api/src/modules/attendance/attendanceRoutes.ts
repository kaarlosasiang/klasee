import { Router, type IRouter } from "express"
import {
  requireAuth,
  requireRole,
} from "../../shared/middleware/auth.middleware.js"
import { attendanceController } from "./attendanceController.js"

const router: IRouter = Router()

router.get("/", requireAuth, attendanceController.list)
router.get("/my", requireAuth, attendanceController.myAttendance)
router.post(
  "/",
  requireAuth,
  requireRole("instructor", "admin"),
  attendanceController.create
)
router.post(
  "/bulk",
  requireAuth,
  requireRole("instructor", "admin"),
  attendanceController.bulkCreate
)
router.put(
  "/:id",
  requireAuth,
  requireRole("instructor", "admin"),
  attendanceController.update
)
router.delete(
  "/:id",
  requireAuth,
  requireRole("instructor", "admin"),
  attendanceController.remove
)

export default router
