// src/routes/HealthRouter.ts
import { Router } from "express";
import { healthController } from "../controllers/HealthController";

class HealthRouter {
    private static instance: HealthRouter;
    public readonly router: Router;

    private constructor() {
        this.router = Router();
        this.registerRoutes();
    }

    public static getInstance(): HealthRouter {
        if (!HealthRouter.instance) {
            HealthRouter.instance = new HealthRouter();
        }
        return HealthRouter.instance;
    }

    private registerRoutes(): void {
        // GET /api/health
        this.router.get("/", (req, res, next) =>
            healthController.health(req, res, next)
        );

        // GET /api/health/deep
        this.router.get("/deep", (req, res, next) =>
            healthController.deepHealth(req, res, next)
        );
    }
}

export const healthRouter = HealthRouter.getInstance().router;
