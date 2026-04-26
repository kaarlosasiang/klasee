import { fromNodeHeaders } from "better-auth/node"
import { NextFunction, Request, Response } from "express"

import { auth } from "../../modules/auth/better-auth.js"
import { AuthenticationError } from "../error-types/authentcation.error.js"
import { AuthorizationError } from "../error-types/authorization.error.js"

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) {
      throw new AuthenticationError("Authentication required")
    }

    req.authSession = session
    req.authUser = session.user

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Require one of the given roles. Must be used after requireAuth.
 * @example router.post("/", requireAuth, requireRole("instructor", "admin"), handler)
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = (req.authUser as any)?.role as string | undefined
    if (!role || !roles.includes(role)) {
      return next(new AuthorizationError("Insufficient role"))
    }
    next()
  }
}
