import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { validate } from "../../shared/middleware/validate.middleware.js"
import { createSectionSchema, updateSectionSchema } from "@workspace/validators"
import { sectionController } from "./sectionController.js"

const router: IRouter = Router()

router.get("/", requireAuth, sectionController.list)
router.get("/:id", requireAuth, sectionController.getById)
router.post("/", requireAuth, requireRole("instructor", "admin"), validate(createSectionSchema), sectionController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), validate(updateSectionSchema), sectionController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), sectionController.remove)
router.post("/:id/generate-code", requireAuth, requireRole("instructor", "admin"), sectionController.generateCode)

export default router
