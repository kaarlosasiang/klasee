import { randomUUID } from "crypto"

import { NextFunction, Request, Response } from "express"

import logger from "../../config/logger.js"

// Extend Express Request type to include correlation ID
declare global {
  namespace Express {
    interface Request {
      correlationId?: string
      startTime?: number
    }
  }
}

/**
 * Middleware to log all incoming requests and outgoing responses
 * Also adds correlation ID for request tracking
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate or extract correlation ID for request tracking
  const correlationId =
    (req.headers["x-correlation-id"] as string) ||
    (req.headers["x-request-id"] as string) ||
    randomUUID()

  // Attach correlation ID to request for downstream use
  req.correlationId = correlationId

  // Set response header for client tracking
  res.setHeader("X-Correlation-ID", correlationId)

  // Track request start time
  req.startTime = Date.now()

  // Log incoming request
  logger.logRequest(req, undefined, correlationId)

  // Capture response finish event
  const originalSend = res.send
  res.send = function (data: any): Response {
    res.send = originalSend // Restore original

    // Calculate response time
    const responseTime = req.startTime ? Date.now() - req.startTime : 0

    // Log response
    logger.logResponse(req, res, responseTime, correlationId)

    return originalSend.call(this, data)
  }

  next()
}

/**
 * Error logging middleware - should be added AFTER all routes
 * Logs errors with full context before passing to error handler
 */
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.logError(err, {
    method: req.method,
    url: req.originalUrl,
    correlationId: req.correlationId,
    userId:
      (req as any)?.currentUser?._id || (req as any)?.user?.id || "anonymous",
    body: req.body,
    query: req.query,
    params: req.params,
  })

  next(err) // Pass to next error handler
}
