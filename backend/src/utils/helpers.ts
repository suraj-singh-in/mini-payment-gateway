export function parseExpiryToSeconds(raw: string | undefined, defaultSeconds: number): number {
    if (!raw) return defaultSeconds;

    const trimmed = raw.trim();

    // If it's pure number, treat as seconds
    if (/^\d+$/.test(trimmed)) {
        return Number(trimmed);
    }

    const match = trimmed.match(/^(\d+)([smhd])$/i);
    if (!match) {
        return defaultSeconds;
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case "s":
            return value;
        case "m":
            return value * 60;
        case "h":
            return value * 60 * 60;
        case "d":
            return value * 60 * 60 * 24;
        default:
            return defaultSeconds;
    }
}
