import { NextFunction, Request, Response } from "express";

import logger from "../../config/logger.js";
import { AuthorizationError } from "../error-types/authorization.error.js";

const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip API key check for health endpoints
  if (
    req.path === "/health" ||
    req.path === "/" ||
    req.path.startsWith("/api/v1/auth")
  ) {
    return next();
  }

  // Check X-API-Key header
  const apiKey = req.headers["x-api-key"];
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    logger.warn("API_KEY environment variable is not set");
    return next(); // Skip validation if API_KEY is not configured
  }

  if (!apiKey || apiKey !== API_KEY) {
    logger.warn("Invalid API Key attempt", {
      ip: req.ip,
      path: req.path,
      correlationId: req.correlationId,
    });
    throw new AuthorizationError("Invalid API Key");
  }

  next();
};

export default apiKeyMiddleware;
