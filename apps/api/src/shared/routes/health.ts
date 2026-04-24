import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { getHealth } from "../controllers/healthController.js";

export const healthRouter: ExpressRouter = Router();

healthRouter.get("/", getHealth);
