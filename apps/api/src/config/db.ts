import mongoose from "mongoose"

import logger from "./logger.js"

// Mongoose configuration
const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.DB_NAME || "accounting-software"

// Connection options
const options: mongoose.ConnectOptions = {
  // Connection pool size
  maxPoolSize: 10,
  minPoolSize: 2,

  // Timeout settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,

  // Retry settings
  retryWrites: false,
  retryReads: true,

  // Database name
  dbName: DB_NAME,
}

/**
 * Connect to MongoDB database
 */
const connect = async (): Promise<void> => {
  try {
    // Check if MONGODB_URI is provided
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined")
    }

    logger.info("Connecting to MongoDB...", {
      uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@"), // Mask password in logs
      database: DB_NAME,
    })

    await mongoose.connect(MONGODB_URI, options)

    logger.info("Database connected successfully", {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      port: mongoose.connection.port,
    })
  } catch (error) {
    logger.logError(error as Error, {
      operation: "database-connection",
      uri: MONGODB_URI
        ? MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")
        : "not-provided",
    })
    process.exit(1)
  }
}

/**
 * Disconnect from MongoDB database
 */
const disconnect = async (): Promise<void> => {
  try {
    await mongoose.disconnect()
    logger.info("Database disconnected successfully")
  } catch (error) {
    logger.logError(error as Error, {
      operation: "database-disconnection",
    })
  }
}

// Connection event listeners
mongoose.connection.on("connected", () => {
  logger.info("Mongoose connected to MongoDB")
})

mongoose.connection.on("error", (err) => {
  logger.logError(err, {
    operation: "mongoose-connection-error",
  })
})

mongoose.connection.on("disconnected", () => {
  logger.warn("Mongoose disconnected from MongoDB")
})

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close()
  logger.info("Mongoose connection closed through app termination")
  process.exit(0)
})

export default {
  connect,
  disconnect,
  mongoose, // Export mongoose instance for connection status checks
}
