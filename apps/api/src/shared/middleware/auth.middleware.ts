import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";

import logger from "../../config/logger.js";
import { authServer } from "../../modules/auth/betterAuth.js";
import {
  hasPermission,
  resolvePermissions,
} from "../auth/permission-resolver.js";
import { Action, OrgRole, Resource } from "../auth/permissions.js";
import { AuthenticationError } from "../error-types/authentcation.error.js";
import { AuthorizationError } from "../error-types/authorization.error.js";
import { getCompanyId, getUserId } from "../helpers/utils.js";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await authServer.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AuthenticationError("Authentication required");
    }

    // Debug log to see what's in the session
    logger.debug("Auth session details", {
      userId: session.user?.id,
      email: session.user?.email,
      companyId: session.user?.companyId,
      role: session.user?.role,
      activeOrganizationId: session.session?.activeOrganizationId,
      sessionKeys: Object.keys(session.session || {}),
      userKeys: Object.keys(session.user || {}),
    });

    req.authSession = session;
    req.authUser = session.user;

    next();
  } catch (error) {
    next(error);
  }
};

// ─── Global app-level admin guard ────────────────────────────────────────────

/**
 * Requires the authenticated user to have a global app-level admin role
 * (admin or super_admin on the BetterAuth `user.role` field).
 *
 * This is DIFFERENT from the per-company org role "admin".
 * Use `requirePermission` for resource-level access control.
 */
export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const role = (req.authUser as any)?.role as string | undefined;
  const roles = role ? role.split(",").map((r: string) => r.trim()) : [];

  if (!roles.some((r) => ["admin", "super_admin"].includes(r))) {
    return next(new AuthorizationError("Admin access required"));
  }

  next();
};

// ─── Per-resource permission guard ───────────────────────────────────────────

/**
 * Middleware factory that enforces a specific resource + action permission.
 *
 * Resolution order:
 *   1. Global admins (admin / super_admin app role) always pass.
 *   2. Load the member's MemberPermission document for the active org.
 *   3. Resolve effective permissions (role base → +grants → −revocations).
 *   4. Check if the effective set includes the required action.
 *
 * @example
 *   router.post("/", requirePermission(Resource.invoice, Action.create), controller.create);
 */
export const requirePermission = (resource: Resource, action: Action) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Global admins bypass org-level permission checks
      const appRole = (req.authUser as any)?.role as string | undefined;
      const appRoles = appRole
        ? appRole.split(",").map((r: string) => r.trim())
        : [];

      if (appRoles.some((r) => ["admin", "super_admin"].includes(r))) {
        return next();
      }

      const userId = getUserId(req);
      const organizationId = getCompanyId(req);

      if (!userId || !organizationId) {
        return next(
          new AuthorizationError("Cannot determine user or organization"),
        );
      }

      // Derive the org-level role from the session to pick the right fallback
      // system role when the user has no MemberPermission record yet.
      const sessionOrgRole = ((req.authSession as any)?.session
        ?.activeOrganizationRole || (req.authSession as any)?.user?.orgRole) as
        | string
        | undefined;

      const validOrgRoles = Object.values(OrgRole) as string[];
      const fallbackRole: OrgRole = validOrgRoles.includes(sessionOrgRole ?? "")
        ? (sessionOrgRole as OrgRole)
        : OrgRole.owner;

      const effective = await resolvePermissions(
        userId,
        organizationId,
        fallbackRole,
      );

      if (!hasPermission(effective, resource, action)) {
        return next(
          new AuthorizationError(
            `You do not have permission to ${action} ${resource}`,
          ),
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
