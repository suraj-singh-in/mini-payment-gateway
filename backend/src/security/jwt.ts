// src/security/jwt.ts
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { config } from "../config";
import { parseExpiryToSeconds } from "../utils/helpers";

export interface JwtPayload {
    sub: string;
    role: string;
    jti?: string;
}

const accessTokenSignOptions: SignOptions = {
    expiresIn: parseExpiryToSeconds(
        config.jwt.accessExpiry,
        15 * 60 // default 15 minutes
    )
};

const refreshTokenSignOptionsBase: SignOptions = {
    expiresIn: parseExpiryToSeconds(
        config.jwt.refreshExpiry,
        7 * 24 * 60 * 60 // default 7 days
    )
};

export function signAccessToken(userId: string, role: string): string {
    const payload: JwtPayload = { sub: userId, role };

    return jwt.sign(
        payload,
        config.jwt.accessSecret as Secret,
        accessTokenSignOptions
    );
}

export function signRefreshToken(userId: string, role: string, jti: string): string {
    const payload: JwtPayload = { sub: userId, role, jti };

    const options: SignOptions = {
        ...refreshTokenSignOptionsBase
    };

    return jwt.sign(payload, config.jwt.refreshSecret as Secret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwt.accessSecret as Secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwt.refreshSecret as Secret) as JwtPayload;
}
