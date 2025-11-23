// src/routes/MerchantRouter.ts
import { Router } from "express";
import { merchantController } from "../controllers/MerchantController";
import { requireAuth } from "../middleware/requireAuth";

class MerchantRouter {
    private static instance: MerchantRouter;
    public readonly router: Router;

    private constructor() {
        this.router = Router();
        this.registerRoutes();
    }

    public static getInstance(): MerchantRouter {
        if (!MerchantRouter.instance) {
            MerchantRouter.instance = new MerchantRouter();
        }
        return MerchantRouter.instance;
    }

    private registerRoutes(): void {
        // Create merchant for current user
        this.router.post("/", requireAuth, (req, res, next) =>
            merchantController.createMerchant(req, res, next)
        );

        // Get merchant info for current user
        this.router.get("/me", requireAuth, (req, res, next) =>
            merchantController.getMyMerchant(req, res, next)
        );

        // update user
        this.router.patch("/me", requireAuth, (req, res, next) =>
            merchantController.updateMyMerchant(req, res, next)
        );

        // get own api credentials
        this.router.get(
            "/me/credentials",
            requireAuth,
            (req, res, next) => merchantController.getOwnApiCredentials(req, res, next)
        );

    }
}

export const merchantRouter = MerchantRouter.getInstance().router;
