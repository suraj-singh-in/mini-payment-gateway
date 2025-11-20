import jwt from "jsonwebtoken";
import { config } from "../config";

const EMAIL_TOKEN_EXPIRY = "1d"; // can tune

export interface EmailTokenPayload {
    sub: string; // user id
    email: string;
}

export function signEmailVerificationToken(
    userId: string,
    email: string
): string {
    const payload: EmailTokenPayload = { sub: userId, email };
    return jwt.sign(payload, config.jwt.accessSecret, {
        expiresIn: EMAIL_TOKEN_EXPIRY
    });
}

export function verifyEmailVerificationToken(token: string): EmailTokenPayload {
    return jwt.verify(token, config.jwt.accessSecret) as EmailTokenPayload;
}
