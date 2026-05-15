import { toNodeHandler } from "better-auth/node"
import { Router } from "express"
import type { Router as ExpressRouter } from "express"

import { auth } from "./better-auth.js"

const router: ExpressRouter = Router()

router.all("/*", toNodeHandler(auth))

export default router
