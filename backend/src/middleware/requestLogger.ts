// src/middleware/basicRequestLogger.ts
import { NextFunction, Request, Response } from "express";
import { log } from "../utils/logger";
import { randomUUID } from "crypto";

export function requestLogger(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const traceId = randomUUID();
    const startTime = new Date();

    // attach traceId to request for anything else (decorators, services, etc.)
    (req as any).traceId = traceId;

    const { method, originalUrl } = req;

    log.http("Incoming request", {
        traceId,
        method,
        url: originalUrl,
        at: startTime.toISOString()
    });

    res.on("finish", () => {
        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();
        const { statusCode } = res;

        log.info("Request completed", {
            traceId,
            method,
            url: originalUrl,
            statusCode,
            startedAt: startTime.toISOString(),
            finishedAt: endTime.toISOString(),
            durationMs
        });
    });

    next();
}
