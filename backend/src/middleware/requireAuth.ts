// src/middleware/requireAuth.ts
import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../security/jwt";

export interface AuthUser {
    id: string;
    role: string;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
    }

    const token = header.slice("Bearer ".length).trim();

    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
