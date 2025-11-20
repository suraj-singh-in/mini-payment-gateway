// src/middleware/cors.ts
import { CorsOptions } from "cors";
import { config } from "../config";

export const corsOptions: CorsOptions = {
    origin(origin, callback) {
        if (!origin || config.cors.allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
};
