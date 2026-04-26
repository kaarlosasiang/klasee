import { toNodeHandler } from "better-auth/node"
import { Application } from "express"

import { auth } from "../modules/auth/better-auth.js"

export default (app: Application): void => {
  const API_PREFIX = "/api/v1"

  // Register directly on app (not a sub-router) so req.url retains the full
  // path that Better Auth needs to match against its basePath.
  app.all(`${API_PREFIX}/auth/*splat`, toNodeHandler(auth))
}
