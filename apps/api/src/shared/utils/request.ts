import { Request } from "express"

export function getUserId(req: Request): string {
  return String(req.authUser?.id ?? req.authUser?._id ?? "")
}

export function getUserRole(req: Request): string | undefined {
  return req.authUser?.role
}
