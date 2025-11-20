// src/controllers/HealthController.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { LogRequest } from "../decorators/LogRequest";

class HealthController {
    private static instance: HealthController;

    private constructor() { }

    public static getInstance(): HealthController {
        if (!HealthController.instance) {
            HealthController.instance = new HealthController();
        }
        return HealthController.instance;
    }

    /**
     * Basic health check – used by load balancers
     */
    @LogRequest({ label: "HealthController.health" })
    public async health(
        _req: Request,
        res: Response,
        _next: NextFunction
    ): Promise<Response> {
        return res.json({ status: "ok" });
    }

    /**
     * Deep health check – used by monitoring tools
     * Checks:
     *   - MongoDB connection
     *   - Environment variables
     */
    @LogRequest({
        label: "HealthController.deepHealth",
    })
    public async deepHealth(
        _req: Request,
        res: Response,
        _next: NextFunction
    ): Promise<Response> {
        // MongoDB Status
        let dbStatus: "connected" | "disconnected" | "connecting" | "unknown" =
            "unknown";

        const readyState = mongoose.connection.readyState;
        switch (readyState) {
            case 1:
                dbStatus = "connected";
                break;
            case 2:
                dbStatus = "connecting";
                break;
            case 0:
                dbStatus = "disconnected";
                break;
        }

        // ENV Validation Check
        const requiredEnvVars = [
            "JWT_ACCESS_SECRET",
            "JWT_REFRESH_SECRET",
            "ENCRYPTION_KEY",
            "MONGODB_URI"
        ];

        const missingEnvVars = requiredEnvVars.filter(
            (key) => !process.env[key] || process.env[key]?.trim() === ""
        );

        const payload = {
            status:
                dbStatus === "connected" && missingEnvVars.length === 0
                    ? "ok"
                    : "degraded",
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                envValid: missingEnvVars.length === 0
            },
            missingEnvVars: missingEnvVars.length ? missingEnvVars : undefined
        };

        return res.json(payload);
    }
}

export const healthController = HealthController.getInstance();
