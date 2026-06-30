import { Router, type IRouter } from "express"
import multer from "multer"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { requireRole } from "../../shared/middleware/auth.middleware.js"
import { requireCourseOwner } from "../../shared/middleware/course.middleware.js"
import { validate } from "../../shared/middleware/validate.middleware.js"
import { pdfOnlyFileFilter } from "../../shared/utils/fileUploadPolicy.js"
import { createCourseSchema, updateCourseSchema, bulkCourseActionSchema } from "@workspace/validators"
import { courseController } from "./courseController.js"

const router: IRouter = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: pdfOnlyFileFilter,
})

router.get("/", requireAuth, courseController.list)
router.get("/archived", requireAuth, courseController.listArchived)
router.get("/:id/audit", requireAuth, requireCourseOwner, courseController.getAuditLogs)
router.get("/:id", requireAuth, requireCourseOwner, courseController.getById)
router.post("/", requireAuth, requireRole("instructor", "admin"), validate(createCourseSchema), courseController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), requireCourseOwner, validate(updateCourseSchema), courseController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), requireCourseOwner, courseController.remove)
router.patch("/:id/archive", requireAuth, requireRole("instructor", "admin"), requireCourseOwner, courseController.archive)
router.patch("/:id/unarchive", requireAuth, requireRole("instructor", "admin"), requireCourseOwner, courseController.unarchive)
router.post("/bulk-archive", requireAuth, requireRole("instructor", "admin"), validate(bulkCourseActionSchema), courseController.bulkArchive)
router.post("/bulk-delete", requireAuth, requireRole("instructor", "admin"), validate(bulkCourseActionSchema), courseController.bulkDelete)
router.post("/parse-faculty-load", requireAuth, requireRole("instructor", "admin"), upload.single("file"), courseController.parseFacultyLoad)

export default router
