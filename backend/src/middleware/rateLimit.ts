// src/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";
import { config } from "../config";

type CreateRateLimiterOptions = {
    windowMs: number;
    max: number;
    message?: string | object;
};

export function createRateLimiter({
    windowMs,
    max,
    message
}: CreateRateLimiterOptions) {
    const options = {
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: message ?? { error: "Too many requests. Please try again later." }
    };

    return rateLimit(options);
}

export const authRateLimiter = createRateLimiter({
    windowMs: config.rateLimit.authWindowMs,
    max: config.rateLimit.authMax,
    message: { error: "Too many auth requests. Try again later." }
});

