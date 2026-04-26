import type { Request, Response } from "express";

import { constants } from "../../config/index.js";

export const getHealth = (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    env: constants.nodeEnv,
    timestamp: new Date().toISOString(),
  });
};
