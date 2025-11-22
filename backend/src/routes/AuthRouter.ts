// src/routes/AuthRouter.ts
import { Router } from "express";
import { authController } from "../controllers/AuthController";
import { requireAuth } from "../middleware/requireAuth";

class AuthRouter {
    private static instance: AuthRouter;
    public readonly router: Router;

    private constructor() {
        this.router = Router();
        this.registerRoutes();
    }

    public static getInstance(): AuthRouter {
        if (!AuthRouter.instance) {
            AuthRouter.instance = new AuthRouter();
        }
        return AuthRouter.instance;
    }

    private registerRoutes(): void {
        // POST /api/auth/register
        this.router.post("/register", (req, res, next) =>
            authController.register(req, res, next)
        );

        // GET /api/auth/verify-email?token=...
        this.router.get("/verify-email", (req, res, next) =>
            authController.verifyEmail(req, res, next)
        );

        this.router.get("/me", requireAuth, (req, res, next) =>
            authController.me(req, res, next)
        );

        // POST /api/auth/login
        this.router.post("/login", (req, res, next) =>
            authController.login(req, res, next)
        );

        // POST /api/auth/refresh
        this.router.post("/refresh", (req, res, next) =>
            authController.refresh(req, res, next)
        );

        // POST /api/auth/logout
        this.router.post("/logout", (req, res, next) =>
            authController.logout(req, res, next)
        );
    }
}

export const authRouter = AuthRouter.getInstance().router;
