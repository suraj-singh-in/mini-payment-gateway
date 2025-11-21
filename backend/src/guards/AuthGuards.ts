// src/guards/AuthGuards.ts
import { z } from "zod";
import { RequestValidationGuard } from "./RequestValidation";

/**
 * POST /api/auth/register
 * Body: { email, password }
 */
export function ValidateRegisterRequest() {
    const bodySchema = z.object({
        email: z.string().email("email must be a valid email"),
        password: z
            .string()
            .min(8, "password must be at least 8 characters long")
    });

    return RequestValidationGuard({
        bodySchema
    });
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export function ValidateLoginRequest() {
    const bodySchema = z.object({
        email: z.string().email("email must be a valid email"),
        password: z
            .string()
            .min(1, "password is required")
    });

    return RequestValidationGuard({
        bodySchema
    });
}

/**
 * POST /api/auth/refresh
 * For now assume body: { refresh_token }
 * (If you move refreshToken to httpOnly cookie later, you can change this)
 */
export function ValidateRefreshTokenRequest() {
    const bodySchema = z.object({
        refresh_token: z
            .string()
            .min(1, "refresh_token is required")
    });

    return RequestValidationGuard({
        bodySchema
    });
}

/**
 * POST /api/auth/logout
 * Body: { refresh_token } (if you require it to revoke)
 */
export function ValidateLogoutRequest() {
    const bodySchema = z.object({
        refresh_token: z
            .string()
            .min(1, "refresh_token is required")
    });

    return RequestValidationGuard({
        bodySchema
    });
}

/**
 * GET /api/auth/verify-email?token=...
 */
export function ValidateVerifyEmailRequest() {
    const querySchema = z.object({
        token: z
            .string()
            .min(1, "token is required")
    });

    return RequestValidationGuard({
        querySchema
    });
}
