import crypto from "crypto";

export function hashUserAgent(userAgentHeader: string | undefined): string {
    const ua = userAgentHeader?.trim() || "unknown";
    return crypto.createHash("sha256").update(ua).digest("hex");
}
