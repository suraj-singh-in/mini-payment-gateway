// src/services/authService.ts
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import { RefreshTokenModel } from "../models/RefreshToken";
import { hashPassword, verifyPassword } from "../security/password";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    JwtPayload
} from "../security/jwt";
import {
    signEmailVerificationToken,
    verifyEmailVerificationToken
} from "../security/emailToken";

export class AuthService {
    private static instance: AuthService;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private hashToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    }

    public async register(email: string, password: string) {
        const existing = await UserModel.findOne({ email });
        if (existing) {
            throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
        }

        const password_hash = await hashPassword(password);
        const user = await UserModel.create({
            email,
            password_hash,
            role: "user"
        });

        const emailToken = signEmailVerificationToken(user.id, user.email);

        return { user, emailToken };
    }

    public async verifyEmail(token: string) {
        let payload: { sub: string; email: string };

        try {
            payload = verifyEmailVerificationToken(token);
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw Object.assign(new Error("Verification token expired"), {
                    statusCode: 400
                });
            }
            throw Object.assign(new Error("Invalid verification token"), {
                statusCode: 400
            });
        }

        const user = await UserModel.findById(payload.sub);
        if (!user) {
            throw Object.assign(new Error("User not found for this token"), {
                statusCode: 404
            });
        }

        return user;
    }

    public async login(email: string, password: string) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
        }

        const ok = await verifyPassword(password, user.password_hash);
        if (!ok) {
            throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
        }

        const accessToken = signAccessToken(user.id, user.role);
        const jti = crypto.randomUUID();
        const refreshToken = signRefreshToken(user.id, user.role, jti);
        const refreshTokenHash = this.hashToken(refreshToken);

        // Decode token to get expiry
        const decoded = jwt.decode(refreshToken) as jwt.JwtPayload;
        const expiresAt = decoded?.exp
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 7 * 24 * 3600 * 1000); // fallback

        await RefreshTokenModel.create({
            user_id: user._id,
            token_hash: refreshTokenHash,
            jti,
            revoked: false,
            expires_at: expiresAt
        });

        return {
            user,
            accessToken,
            refreshToken
        };
    }

    public async refresh(oldRefreshToken: string) {
        let payload: JwtPayload;

        try {
            payload = verifyRefreshToken(oldRefreshToken);
        } catch (err) {
            throw Object.assign(new Error("Invalid refresh token"), { statusCode: 401 });
        }

        const tokenHash = this.hashToken(oldRefreshToken);
        const stored = await RefreshTokenModel.findOne({
            token_hash: tokenHash,
            jti: payload.jti,
            revoked: false
        });

        if (!stored) {
            throw Object.assign(new Error("Refresh token revoked or not found"), {
                statusCode: 401
            });
        }

        if (stored.expires_at.getTime() < Date.now()) {
            throw Object.assign(new Error("Refresh token expired"), { statusCode: 401 });
        }

        const user = await UserModel.findById(payload.sub);
        if (!user) {
            throw Object.assign(new Error("User not found"), { statusCode: 404 });
        }

        // Option: rotate refresh token (recommended)
        stored.revoked = true;
        await stored.save();

        const newJti = crypto.randomUUID();
        const newRefreshToken = signRefreshToken(user.id, user.role, newJti);
        const newHash = this.hashToken(newRefreshToken);
        const decoded = jwt.decode(newRefreshToken) as jwt.JwtPayload;
        const expiresAt = decoded?.exp
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 7 * 24 * 3600 * 1000);

        await RefreshTokenModel.create({
            user_id: user._id,
            token_hash: newHash,
            jti: newJti,
            revoked: false,
            expires_at: expiresAt
        });

        const accessToken = signAccessToken(user.id, user.role);

        return {
            user,
            accessToken,
            refreshToken: newRefreshToken
        };
    }

    public async logout(refreshToken: string) {
        const tokenHash = this.hashToken(refreshToken);
        await RefreshTokenModel.updateOne(
            { token_hash: tokenHash },
            { $set: { revoked: true } }
        );
    }
}

export const authService = AuthService.getInstance();
