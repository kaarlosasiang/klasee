import "express"

// Augment the global Express namespace — the correct pattern for adding
// custom properties to req (Request) in Express middleware.
declare global {
  namespace Express {
    interface Request {
      authUser?: Record<string, unknown>
      authSession?: Record<string, unknown>
    }
  }
}
