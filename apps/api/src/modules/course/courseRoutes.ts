import { Router, type IRouter } from "express"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { requireRole } from "../../shared/middleware/auth.middleware.js"
import { requireCourseOwner } from "../../shared/middleware/course.middleware.js"
import { courseController } from "./courseController.js"

const router: IRouter = Router()

router.get("/", requireAuth, courseController.list)
router.get("/archived", requireAuth, courseController.listArchived)
router.get("/:id/audit", requireAuth, requireCourseOwner, courseController.getAuditLogs)
router.get("/:id", requireAuth, requireCourseOwner, courseController.getById)
router.post("/", requireAuth, requireRole("instructor", "admin"), courseController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), requireCourseOwner, courseController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), requireCourseOwner, courseController.remove)
router.patch("/:id/archive", requireAuth, requireRole("instructor", "admin"), requireCourseOwner, courseController.archive)
router.patch("/:id/unarchive", requireAuth, requireRole("instructor", "admin"), requireCourseOwner, courseController.unarchive)
router.post("/:id/duplicate", requireAuth, requireRole("instructor", "admin"), requireCourseOwner, courseController.duplicate)
router.post("/bulk-archive", requireAuth, requireRole("instructor", "admin"), courseController.bulkArchive)
router.post("/bulk-delete", requireAuth, requireRole("instructor", "admin"), courseController.bulkDelete)
router.post("/bulk-duplicate", requireAuth, requireRole("instructor", "admin"), courseController.bulkDuplicate)

export default router
