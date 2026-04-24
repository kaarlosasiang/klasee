import mongoose from "mongoose";

import { appConfig } from "./app.js";
import { logger } from "./logger.js";

export const connectDB = async (): Promise<void> => {
	if (!appConfig.mongoUri) {
		logger.warn("MONGO_URI is not set. Starting API without database connection.");
		return;
	}

	await mongoose.connect(appConfig.mongoUri);
	logger.info("MongoDB connected");
};

