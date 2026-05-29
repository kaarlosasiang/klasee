import "express"

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string
        _id?: string
        role?: string
        name?: string
        email?: string
      }
      authSession?: unknown
    }
  }
}
