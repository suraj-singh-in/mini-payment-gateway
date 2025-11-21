// src/controllers/AuthController.ts
import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";
import { LogRequest } from "../decorators/LogRequest";

import {
    ValidateRegisterRequest,
    ValidateLoginRequest,
    ValidateRefreshTokenRequest,
    ValidateLogoutRequest,
    ValidateVerifyEmailRequest
} from "../guards/AuthGuards";


export class AuthController {
    private static instance: AuthController;

    private constructor() { }

    public static getInstance(): AuthController {
        if (!AuthController.instance) {
            AuthController.instance = new AuthController();
        }
        return AuthController.instance;
    }

    @LogRequest({ label: "AuthController.register", extraSensitiveFields: ["password"] })
    @ValidateRegisterRequest()
    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const { user, emailToken } = await authService.register(email, password);

            // For now: just return token in response (in real world: send email)
            return res.status(201).json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                emailVerificationToken: emailToken
            });
        } catch (err) {
            next(err);
        }
    }

    @LogRequest({ label: "AuthController.verifyEmail" })
    @ValidateVerifyEmailRequest()
    public async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.query.token as string;
            if (!token) {
                return res.status(400).json({ error: "Missing token" });
            }

            const user = await authService.verifyEmail(token);

            return res.json({
                message: "Email verified successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (err) {
            next(err);
        }
    }

    @LogRequest({
        label: "AuthController.login",
        extraSensitiveFields: ["password", "email"]
    })
    @ValidateLoginRequest()
    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken } = await authService.login(
                email,
                password
            );

            return res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                accessToken,
                refreshToken
            });
        } catch (err) {
            next(err);
        }
    }

    @LogRequest({ label: "AuthController.refresh", extraSensitiveFields: ["refreshToken"] })
    @ValidateRefreshTokenRequest()
    public async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ error: "Missing refresh token" });
            }

            const { user, accessToken, refreshToken: newRefreshToken } =
                await authService.refresh(refreshToken);

            return res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                accessToken,
                refreshToken: newRefreshToken
            });
        } catch (err) {
            next(err);
        }
    }

    @LogRequest({ label: "AuthController.logout", extraSensitiveFields: ["refreshToken"] })
    @ValidateLogoutRequest()
    public async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (refreshToken) {
                await authService.logout(refreshToken);
            }

            return res.json({ message: "Logged out" });
        } catch (err) {
            next(err);
        }
    }
}

export const authController = AuthController.getInstance();
