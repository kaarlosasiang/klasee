import { app } from "./app.js";
import { appConfig, connectDB, logger } from "./config/index.js";

const start = async () => {
	try {
		await connectDB();

		app.listen(appConfig.port, () => {
			logger.info("API server started", {
				env: appConfig.nodeEnv,
				port: appConfig.port,
			});
		});
	} catch (error) {
		logger.error("Failed to start API server", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		process.exit(1);
	}
};

void start();

