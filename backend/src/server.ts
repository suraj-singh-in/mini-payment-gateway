// src/server.ts
import http from "http";
import { app } from "./app";
import { config } from "./config";
import { connectDB } from "./db/mongoose";

async function start() {
    await connectDB();

    const server = http.createServer(app);

    server.listen(config.port, () => {
        console.log(`[SERVER] Running on port ${config.port} (${config.nodeEnv})`);
    });

    // Graceful shutdown
    const shutdown = () => {
        console.log("[SERVER] Shutting down...");
        server.close(() => {
            console.log("[SERVER] Closed HTTP server");
            process.exit(0);
        });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}

start().catch((err) => {
    console.error("[SERVER] Failed to start", err);
    process.exit(1);
});
