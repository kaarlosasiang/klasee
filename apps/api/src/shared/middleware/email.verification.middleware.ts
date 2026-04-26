import { NextFunction, Request, Response } from "express";

import logger from "../../config/logger.js";

/**
 * Middleware to check if user's email is verified
 * Requires auth.middleware to run first to populate req.user
 */
export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "You must be logged in to access this resource",
      });
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      logger.warn("Unverified email access attempt", {
        userId: user.id,
        email: user.email,
        path: req.path,
      });

      res.status(403).json({
        error: "Email not verified",
        message:
          "Please verify your email address before accessing this resource",
        emailVerified: false,
      });
      return;
    }

    // Email is verified, proceed
    next();
  } catch (error) {
    logger.error("Error in email verification middleware", {
      error: error instanceof Error ? error.message : String(error),
      path: req.path,
    });

    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while checking email verification",
    });
  }
};

/**
 * Middleware to add email verification status to response
 * Useful for endpoints that want to check but not block
 */
export const checkEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const user = (req as any).user;

    if (user) {
      // Add verification status to request for downstream use
      (req as any).emailVerified = user.emailVerified || false;
    }

    next();
  } catch (error) {
    logger.error("Error checking email verification", {
      error: error instanceof Error ? error.message : String(error),
    });
    next(); // Continue even if check fails
  }
};
