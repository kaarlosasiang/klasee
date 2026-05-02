import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { enrollmentController } from "./enrollmentController.js"

const router: IRouter = Router()

// List enrollments
router.get("/", requireAuth, enrollmentController.list)

// Student joins via instructor-generated code
router.post("/join", requireAuth, enrollmentController.joinByCode)

// Direct create (instructor/admin manually enrolling someone)
router.post("/", requireAuth, requireRole("instructor", "admin"), enrollmentController.create)

// Instructors/admins can update enrollment status
router.put("/:id", requireAuth, requireRole("instructor", "admin"), enrollmentController.update)

// Students can drop themselves; instructors/admins can drop anyone
router.delete("/:id", requireAuth, enrollmentController.drop)

export default router
