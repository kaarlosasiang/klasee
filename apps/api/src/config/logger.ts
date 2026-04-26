import path from "path"

import winston, { format, Logger, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

// Create custom interface extending Winston Logger
interface CustomLogger extends Logger {
  logRequest: (req: any, responseTime?: number, correlationId?: string) => void
  logResponse: (
    req: any,
    res: any,
    responseTime: number,
    correlationId?: string
  ) => void
  logError: (error: Error, context?: any) => void
}

// Log directory - can be configured via env var
const LOG_DIR = process.env.LOG_DIR || "logs"
const LOG_LEVEL =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === "production" ? "info" : "debug")
const APP_NAME = process.env.APP_NAME || "rrd10-sas-api"

// Validate configuration on startup
const validateConfig = () => {
  if (!process.env.NODE_ENV) {
    console.warn("NODE_ENV not set, defaulting to 'development'")
    process.env.NODE_ENV = "development"
  }
}

validateConfig()

// Sanitize sensitive data from logs
const sensitiveFields = [
  "password",
  "token",
  "authorization",
  "cookie",
  "secret",
  "apiKey",
  "api_key",
  "accessToken",
  "refreshToken",
  "creditCard",
  "ssn",
]

const sanitizeData = (data: any): any => {
  if (!data || typeof data !== "object") return data

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item))
  }

  const sanitized: any = {}
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    if (sensitiveFields.some((field) => lowerKey.includes(field))) {
      sanitized[key] = "[REDACTED]"
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

// Get HTTP status category for better logging
const getStatusCategory = (statusCode: number): string => {
  if (statusCode >= 500) return "SERVER_ERROR"
  if (statusCode >= 400) return "CLIENT_ERROR"
  if (statusCode >= 300) return "REDIRECT"
  if (statusCode >= 200) return "SUCCESS"
  return "INFORMATIONAL"
}

// Custom format that includes more context
const customFormat = format.printf(
  ({ timestamp, level, message, service, correlationId, ...meta }) => {
    const prefix = correlationId ? `[${correlationId}] ` : ""

    // Handle error stack traces specially
    if (meta.stack) {
      return `${timestamp} [${service}] ${prefix}${level}: ${message}\n${meta.stack}`
    }

    // Format regular logs with metadata if present
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : ""
    return `${timestamp} [${service}] ${prefix}${level}: ${message}${metaStr}`
  }
)

// Base format used in all transports
const baseFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.metadata({
    fillExcept: [
      "message",
      "level",
      "timestamp",
      "label",
      "service",
      "correlationId",
    ],
  })
)

// Create transports array based on environment
const configureTransports = () => {
  const transportsList: winston.transport[] = []

  // Console transport - formatted differently based on environment
  if (process.env.NODE_ENV === "development") {
    transportsList.push(
      new transports.Console({
        level: LOG_LEVEL,
        format: format.combine(format.colorize(), customFormat),
      })
    )
  } else {
    // JSON format for production (better for log aggregation tools)
    transportsList.push(
      new transports.Console({
        level: LOG_LEVEL,
        format: format.combine(format.json(), format.timestamp()),
      })
    )

    // Add file transports for production
    // Error logs
    transportsList.push(
      new DailyRotateFile({
        level: "error",
        dirname: path.join(LOG_DIR, "error"),
        filename: `${APP_NAME}-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxFiles: "14d",
        format: format.combine(format.uncolorize(), customFormat),
      })
    )

    // Combined logs
    transportsList.push(
      new DailyRotateFile({
        level: LOG_LEVEL,
        dirname: path.join(LOG_DIR),
        filename: `${APP_NAME}-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxFiles: "7d",
        format: format.combine(format.uncolorize(), customFormat),
      })
    )
  }

  return transportsList
}

// Create the logger instance
const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: {
    service: APP_NAME,
    environment: process.env.NODE_ENV || "development",
  },
  format: baseFormat,
  transports: configureTransports(),
  exitOnError: false,
})

// Cast to custom logger type
const LoggerInstance = logger as CustomLogger

// Helper method to log request info (useful in middleware)
LoggerInstance.logRequest = (
  req: any,
  responseTime?: number,
  correlationId?: string
) => {
  const logData = sanitizeData({
    method: req.method,
    url: req.originalUrl,
    responseTime: responseTime ? `${responseTime}ms` : undefined,
    ip: req.ip,
    userId: req?.currentUser?._id || req?.user?.id || "anonymous",
    userAgent: req.get("user-agent"),
    correlationId,
  })

  LoggerInstance.info(`Request: ${req.method} ${req.originalUrl}`, logData)
}

// Helper method to log response info
LoggerInstance.logResponse = (
  req: any,
  res: any,
  responseTime: number,
  correlationId?: string
) => {
  const logData = sanitizeData({
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    statusCategory: getStatusCategory(res.statusCode),
    responseTime: `${responseTime}ms`,
    userId: req?.currentUser?._id || req?.user?.id || "anonymous",
    correlationId,
    slow: responseTime > 1000, // Flag slow requests
  })

  // Determine log level based on status and performance
  let level: string = "info"
  if (res.statusCode >= 500) {
    level = "error"
  } else if (res.statusCode >= 400 || responseTime > 1000) {
    level = "warn"
  }

  LoggerInstance.log(
    level,
    `Response: ${res.statusCode} ${req.method} ${req.originalUrl}`,
    logData
  )
}

// Helper method for structured error logging
LoggerInstance.logError = (error: Error, context?: any) => {
  LoggerInstance.error(error.message, {
    stack: error.stack,
    name: error.name,
    context: sanitizeData(context || {}),
    timestamp: new Date().toISOString(),
  })
}

// Log startup information
// LoggerInstance.info("Logger initialized", {
//   environment: process.env.NODE_ENV,
//   logLevel: LOG_LEVEL,
//   logDir: LOG_DIR,
//   appName: APP_NAME,
// });

export default LoggerInstance
