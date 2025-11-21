import { Router } from "express";
import { transactionController } from "../controllers/TransactionController";
import { merchantHmacAuth } from "../middleware/merchantHmacAuth";
import { requireAuth } from "../middleware/requireAuth";
import { requireCheckoutCookie } from "../middleware/requireCheckoutCookie";

class TransactionRouter {
    private static instance: TransactionRouter;
    public readonly router: Router;

    private constructor() {
        this.router = Router();
        this.registerRoutes();
    }

    public static getInstance(): TransactionRouter {
        if (!TransactionRouter.instance) {
            TransactionRouter.instance = new TransactionRouter();
        }
        return TransactionRouter.instance;
    }

    private registerRoutes(): void {
        // 1) Create checkout session (merchant-signed)
        this.router.post(
            "/checkout/init",
            merchantHmacAuth,
            (req, res, next) => transactionController.createCheckoutSession(req, res, next)
        );

        // 2) Process payment for a checkout session (mock)
        this.router.post(
            "/checkout/:sessionId/pay",
            requireCheckoutCookie,
            (req, res, next) => transactionController.processPayment(req, res, next)
        );

        // 3) Merchant dashboard – history
        this.router.get(
            "/",
            requireAuth,
            (req, res, next) => transactionController.getTransactions(req, res, next)
        );

        // 4) Merchant dashboard – details
        this.router.get(
            "/:id",
            requireAuth,
            (req, res, next) => transactionController.getTransactionDetails(req, res, next)
        );
    }
}

export const transactionRouter = TransactionRouter.getInstance().router;
