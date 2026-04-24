import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { Express, Request, Response } from "express";

import { appConfig } from "./config/index.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import { healthRouter } from "./shared/routes/health.js";

export const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: appConfig.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "klasee-api",
    status: "ok",
  });
});

app.use("/api/health", healthRouter);

app.use(errorHandler);
