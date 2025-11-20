// src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { corsOptions } from "./middleware/cors";
import { masterRouter } from "./routes/MasterRouter";
import { requestLogger } from "./middleware/requestLogger";


export const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Trust proxy (for HTTPS termination via Nginx/ELB in prod)
app.set("trust proxy", 1);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());

// logging
app.use(requestLogger);

// Routes
app.use("/api", masterRouter);

// Error handler (keep last)
app.use(errorHandler);
