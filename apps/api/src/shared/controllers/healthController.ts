import type { Request, Response } from "express";

import { appConfig } from "../../config/index.js";

export const getHealth = (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    env: appConfig.nodeEnv,
    timestamp: new Date().toISOString(),
  });
};
