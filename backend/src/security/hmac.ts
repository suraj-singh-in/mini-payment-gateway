// src/security/hmac.ts
import crypto from "crypto";
import { config } from "../config";

const DEFAULT_ALGO = (config.hmacAlgo || "sha256").toLowerCase();

export function computeHmac(
    payload: string,
    secret: string,
    algo: string = DEFAULT_ALGO
): string {
    return crypto.createHmac(algo, secret).update(payload).digest("hex");
}

/**
 * For request signing we’ll use:
 * signingString = `${timestamp}.${bodyJson}`
 */
export function buildSigningString(timestamp: string, body: unknown): string {
    const bodyJson = body ? JSON.stringify(body) : "";
    return `${timestamp}.${bodyJson}`;
}
