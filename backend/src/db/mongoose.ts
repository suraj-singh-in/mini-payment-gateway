import mongoose from "mongoose";
import { config } from "../config";

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(config.mongoUri);
        console.log("[DB] Connected to MongoDB");
    } catch (err) {
        console.error("[DB] Connection error", err);
        process.exit(1);
    }
}

export function disconnectDB(): Promise<void> {
    return mongoose.disconnect();
}
