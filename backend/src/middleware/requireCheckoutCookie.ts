// src/middleware/requireCheckoutCookie.ts
import { NextFunction, Response } from "express";
import { CheckoutSessionModel } from "../models/CheckoutSession";
import { hashUserAgent } from "../security/userAgent";
import { AuthRequest } from "./requireAuth";

export async function requireCheckoutCookie(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const { sessionId } = req.params;
    const cookieHash = req.cookies?.pg_session as string | undefined;

    if (!cookieHash) {
        return res.status(401).json({ error: "Missing checkout session cookie" });
    }

    const session = await CheckoutSessionModel.findById(sessionId);
    if (!session) {
        return res.status(404).json({ error: "Checkout session not found" });
    }

    const currentUserAgentHash = hashUserAgent(req.headers["user-agent"] as string | undefined);

    // Must match both the cookie and the stored session UA hash
    if (cookieHash !== currentUserAgentHash || session.user_agent_hash !== currentUserAgentHash) {
        return res.status(401).json({ error: "Invalid checkout session context" });
    }

    // Attach session for downstream handlers to reuse
    (req as any).checkoutSession = session;
    next();
}
