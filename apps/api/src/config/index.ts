import dotenv from "dotenv"

import dbConnection from "./db.js"

dotenv.config()

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const constants = {
  // Server
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Frontend
  frontEndUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  // API Security
  apiKey: process.env.API_KEY || "",

  // Database
  mongodbUri: process.env.MONGODB_URI as string,
  dbName: process.env.DB_NAME || "accounting-software",

  // JWT (for future auth)
  jwtSecret: (() => {
    if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
      throw new Error("CRITICAL: JWT_SECRET is required in production")
    }
    return process.env.JWT_SECRET || "dev-jwt-secret-CHANGE-IN-PRODUCTION"
  })(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // Logging
  logLevel: process.env.LOG_LEVEL || "debug",
  logDir: process.env.LOG_DIR || "./logs",
  appName: process.env.APP_NAME || "rrd10-sas-api",

  // CORS
  corsOrigin:
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000",

  // Better Auth
  betterAuthSecret: (() => {
    if (
      process.env.NODE_ENV === "production" &&
      !process.env.BETTER_AUTH_SECRET
    ) {
      throw new Error("CRITICAL: BETTER_AUTH_SECRET is required in production")
    }
    return (
      process.env.BETTER_AUTH_SECRET || "dev-better-auth-secret-min-32-chars"
    )
  })(),

  betterAuthUrl:
    process.env.BETTER_AUTH_URL ||
    `${process.env.API_BASE_URL || `http://localhost:${Number(process.env.PORT) || 4000}`}/api/v1/auth`,

  // Origin-only URL for Better-Auth baseURL (must not include path)
  betterAuthOrigin: (() => {
    const url =
      process.env.BETTER_AUTH_URL ||
      `http://localhost:${Number(process.env.PORT) || 4000}`
    try {
      return new URL(url).origin
    } catch {
      return url
    }
  })(),
  
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
}
export { constants, dbConnection }
