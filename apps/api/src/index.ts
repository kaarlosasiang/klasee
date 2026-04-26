import "dotenv/config"
import express from "express"

import configureApp from "./config/app.js"

import { constants } from "./config/index.js"
import { dbConnection } from "./config/index.js"
import logger from "./config/logger.js"

const app = express()

configureApp(app)

const startServer = async () => {
  try {
    // Connect to database first
    await dbConnection.connect()

    // Then start the server
    app.listen(constants.port, () => {
      logger.info(`Server started on port ${constants.port}`, {
        port: constants.port,
        environment: constants.nodeEnv,
        frontendUrl: constants.frontEndUrl,
      })
    })
  } catch (error) {
    logger.logError(error as Error, {
      operation: "server-startup",
    })
    process.exit(1)
  }
}

// Start the application
startServer()
