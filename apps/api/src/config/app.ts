import cookieParser from "cookie-parser"
import cors from "cors"
import express, { Application, Request, Response } from "express"
import helmet from "helmet"
import morgan from "morgan"

import registerRoutes from "../routes/index.js"
import apiKeyMiddleware from "../shared/middleware/apiKey.middleware.js"
import {
  errorLogger,
  requestLogger,
} from "../shared/middleware/logger.middleware.js"

import dbConnection from "./db.js"
import { constants } from "./index.js"
import logger from "./logger.js"

export default (app: Application): Application => {
  // Trust the reverse proxy (nginx) so req.secure, req.protocol and req.ip
  // reflect the original HTTPS connection instead of the internal HTTP hop.
  // Required for Secure cookies and OAuth redirects to work behind a proxy.
  app.set("trust proxy", 1)

  // Security middleware - disable CSP for Better Auth
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          "http://localhost:3000",
          "https://amfintrass.com",
          "https://www.amfintrass.com",
          "https://app.amfintrass.com",
        ]
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error("Not allowed by CORS"))
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "User-Agent", // Safari includes User-Agent in cross-origin preflight requests
      ],
      exposedHeaders: ["Set-Cookie"],
      optionsSuccessStatus: 200,
    })
  )

  // Cookie parsing - Better Auth needs this early
  app.use(cookieParser())

  // HTTP request logging (morgan + winston)
  if (constants.nodeEnv === "development") {
    app.use(morgan("dev"))
  } else {
    // Production: log to winston
    app.use(
      morgan("combined", {
        stream: {
          write: (message: string) => {
            logger.info(message.trim())
          },
        },
      })
    )
  }

  // Custom request/response logger
  app.use(requestLogger)

  // Default route
  app.get("/", (req: Request, res: Response) => {
    res.json({
      message: "RRD10 SAS API is running",
      version: "1.0.0",
      environment: constants.nodeEnv,
    })
  })

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    const dbStatus =
      dbConnection.mongoose?.connection?.readyState === 1
        ? "connected"
        : "disconnected"

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
      environment: constants.nodeEnv,
    })
  })

  // Status check (returns frontend URL)
  app.get("/status", (req: Request, res: Response) => {
    res.json({
      frontendUrl: constants.frontEndUrl,
      apiVersion: "1.0.0",
    })
  })

  // Body parsing middleware - needed for most routes except Better Auth
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Register all routes (Better Auth handles its own body parsing)
  registerRoutes(app)

  // API Key middleware (applied to non-auth routes only)
  // Auth routes are already registered and handle their own authentication
  app.use("/api/v1/users", apiKeyMiddleware)

  // Error logging middleware (before error handlers)
  app.use(errorLogger)

  // Global error handler (must have 4 parameters to be recognized as error handler)
  app.use((err: any, req: Request, res: Response, _next: Function) => {
    // Log the error
    logger.logError(err, {
      path: req.path,
      method: req.method,
      correlationId: req.correlationId,
    })

    res.status(err.status || 500).json({
      error:
        constants.nodeEnv === "production"
          ? "Internal server error"
          : err.message,
      correlationId: req.correlationId,
    })
  })

  return app
}
