// src/middleware/merchantHmacAuth.ts
import { NextFunction, Response } from "express";
import { AuthRequest } from "./requireAuth";
import { merchantService } from "../services/MerchantService";
import { buildSigningString, computeHmac } from "../security/hmac";
import crypto from "crypto";

export async function merchantHmacAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const apiKey = req.headers["x-api-key"] as string | undefined;
    const signature = req.headers["x-signature"] as string | undefined;
    const timestamp = req.headers["x-timestamp"] as string | undefined;

    if (!apiKey || !signature || !timestamp) {
        return res.status(401).json({ error: "Missing HMAC authentication headers" });
    }

    // Basic replay protection
    const ts = Number(timestamp);
    if (!Number.isFinite(ts)) {
        return res.status(400).json({ error: "Invalid timestamp" });
    }

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (Math.abs(now - ts) > fiveMinutes) {
        return res.status(401).json({ error: "Request timestamp is too far from server time" });
    }

    const merchant = await merchantService.getMerchantByApiKey(apiKey);
    if (!merchant || merchant.status !== "active") {
        return res.status(401).json({ error: "Invalid or inactive merchant" });
    }

    const encryptedSecret: string = merchant.api_secret;
    const secretPlain = merchantService.decryptApiSecret(encryptedSecret);

    const signingString = buildSigningString(timestamp, req.body || {});
    const expected = computeHmac(signingString, secretPlain);

    // timing-safe comparison
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return res.status(401).json({ error: "Invalid HMAC signature" });
    }

    // attach merchant to request for downstream handlers
    (req as any).merchant = merchant;

    next();
}
