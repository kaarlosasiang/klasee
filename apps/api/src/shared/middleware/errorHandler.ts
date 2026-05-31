import type { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if ((err as any).code === 11000) {
    const keyValue = (err as any).keyValue as Record<string, unknown> | undefined
    const field = keyValue ? Object.keys(keyValue)[0] : "field"
    res.status(409).json({ message: `${field} already exists` })
    return
  }

  const status = (err as { status?: number }).status ?? 500;

  res.status(status).json({
    message: err.message || "Internal Server Error",
  });
};
