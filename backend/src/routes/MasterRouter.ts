import { Router } from "express";
import { healthRouter } from "./HealthRouter";
// import { authRouter } from "./authRoutes";
// import { merchantRouter } from "./merchantRoutes";
// import { transactionRouter } from "./transactionRoutes";
// import { webhookRouter } from "./webhookRoutes";

class MasterRouter {
    private static instance: MasterRouter;
    public readonly router: Router;

    // Private constructor to enforce singleton
    private constructor() {
        this.router = Router();
        this.registerRoutes();
    }

    // Global access point
    public static getInstance(): MasterRouter {
        if (!MasterRouter.instance) {
            MasterRouter.instance = new MasterRouter();
        }
        return MasterRouter.instance;
    }

    // Attach all sub-routers here
    private registerRoutes(): void {
        // /api/auth/*
        // this.router.use("/auth", authRouter);

        // /api/merchants/*
        // this.router.use("/merchants", merchantRouter);

        // /api/transactions/*
        // this.router.use("/transactions", transactionRouter);

        // /api/webhooks/*
        // this.router.use("/webhooks", webhookRouter);

        this.router.use("/health", healthRouter);

        // Optionally, a catch-all 404 for unknown /api routes
        this.router.use((_req, res) => {
            return res.status(404).json({ error: "API route not found" });
        });
    }
}

// Export just the router instance to keep app.ts clean
export const masterRouter = MasterRouter.getInstance().router;
