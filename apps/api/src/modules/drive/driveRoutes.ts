import { Router, type IRouter } from "express"
import multer from "multer"
import { requireAuth } from "../../shared/middleware/auth.middleware.js"
import { driveController } from "./driveController.js"

const router: IRouter = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get("/status", requireAuth, driveController.status)
router.post("/setup", requireAuth, driveController.setup)
router.post("/course-folders", requireAuth, driveController.ensureCourseFolders)
router.get("/files", requireAuth, driveController.list)
router.post("/folders", requireAuth, driveController.createFolder)
router.post("/upload", requireAuth, upload.single("file"), driveController.upload)
router.get("/files/:id/download", requireAuth, driveController.download)
router.get("/files/:id/stream", requireAuth, driveController.stream)
router.delete("/files/:id", requireAuth, driveController.delete)
router.patch("/files/:id", requireAuth, driveController.rename)
router.patch("/files/:id/move", requireAuth, driveController.moveFile)
router.patch("/files/:id/move-to-root", requireAuth, driveController.moveFileToRoot)
router.post("/disconnect", requireAuth, driveController.disconnect)

export default router
