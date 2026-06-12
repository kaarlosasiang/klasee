import { Router, type IRouter } from "express"
import { requireAuth, requireRole } from "../../shared/middleware/auth.middleware.js"
import { validate } from "../../shared/middleware/validate.middleware.js"
import { createQuestionSchema, updateQuestionSchema } from "@workspace/validators"
import { questionController } from "./questionController.js"

const router: IRouter = Router()

router.get("/", requireAuth, questionController.list)
router.get("/:id", requireAuth, questionController.getById)
router.post("/", requireAuth, requireRole("instructor", "admin"), validate(createQuestionSchema), questionController.create)
router.put("/:id", requireAuth, requireRole("instructor", "admin"), validate(updateQuestionSchema), questionController.update)
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), questionController.remove)
router.patch("/reorder", requireAuth, requireRole("instructor", "admin"), questionController.reorder)

export default router
