import { toNodeHandler } from "better-auth/node"
import { Router } from "express"
import type { Router as ExpressRouter } from "express"

import { auth } from "./better-auth.js"

const router: ExpressRouter = Router()

// Express v5: Use * wildcard without leading slash for catch-all
// This catches all routes like /sign-up/email, /sign-in/email, /ok, etc.
router.all("/*splat", toNodeHandler(auth))

export default router
