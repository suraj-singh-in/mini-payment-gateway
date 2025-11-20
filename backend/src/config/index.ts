import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}

export const config = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "8080", 10),

    mongoUri: requireEnv("MONGODB_URI"),

    jwt: {
        accessSecret: requireEnv("JWT_ACCESS_SECRET"),
        refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d"
    },

    encryptionKey: requireEnv("ENCRYPTION_KEY"),
    hmacAlgo: process.env.HMAC_DEFAULT_ALGO || "sha256",

    cors: {
        allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || "")
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
    },

    rateLimit: {
        authWindowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || "900000", 10),
        authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "10", 10)
    }
};
