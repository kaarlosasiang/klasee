import { Router, type IRouter } from "express"
import multer from "multer"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { driveController } from "./driveController.js"

const router: IRouter = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get("/status", requireAuth, driveController.status)
router.post("/setup", requireAuth, driveController.setup)
router.post("/course-folders", requireAuth, driveController.ensureCourseFolders)
router.get("/files", requireAuth, driveController.list)
router.post("/folders", requireAuth, requireRole("instructor", "admin"), driveController.createFolder)
router.post("/upload", requireAuth, requireRole("instructor", "admin"), upload.single("file"), driveController.upload)
router.post("/upload/student", requireAuth, upload.single("file"), driveController.studentUpload)
router.get("/files/:id/download", requireAuth, driveController.download)
router.get("/files/:id/stream", requireAuth, driveController.stream)
router.delete("/files/:id", requireAuth, requireRole("instructor", "admin"), driveController.delete)
router.patch("/files/:id", requireAuth, requireRole("instructor", "admin"), driveController.rename)
router.patch("/files/:id/publish", requireAuth, requireRole("instructor", "admin"), driveController.togglePublish)
router.patch("/files/:id/move", requireAuth, requireRole("instructor", "admin"), driveController.moveFile)
router.patch("/files/:id/move-to-root", requireAuth, requireRole("instructor", "admin"), driveController.moveFileToRoot)
router.post("/disconnect", requireAuth, driveController.disconnect)

export default router
