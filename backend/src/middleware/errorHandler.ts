// src/middleware/errorHandler.ts
import { NextFunction, Request, Response } from "express";
import { config } from "../config";

interface AppError extends Error {
    statusCode?: number;
    details?: unknown;
}

export function errorHandler(
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const statusCode = err.statusCode || 500;

    if (config.nodeEnv !== "test") {
        console.error("[ERROR]", {
            message: err.message,
            statusCode,
            stack: config.nodeEnv === "development" ? err.stack : undefined
        });
    }

    const response: Record<string, unknown> = {
        error: err.message || "Internal server error"
    };

    if (config.nodeEnv === "development" && err.details) {
        response.details = err.details;
    }

    // Never expose stack in prod
    res.status(statusCode).json(response);
}
