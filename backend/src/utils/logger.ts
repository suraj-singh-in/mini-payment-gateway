// src/utils/logger.ts
import winston from "winston";
import chalk from "chalk";

const { combine, timestamp, printf } = winston.format;

export type LogLevel =
    | "error"
    | "warn"
    | "info"
    | "http"
    | "verbose"
    | "debug"
    | "silly";

// Default sensitive keys that will be masked
const DEFAULT_SENSITIVE_KEYS = [
    "password",
    "passwordHash",
    "currentPassword",
    "newPassword",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "apiKey",
    "apiSecret",
    "api_key",
    "api_secret",
    "x-api-key",
    "X-API-KEY",
    "signature",
    "X-SIGNATURE"
];

export function redactSensitive(
    value: unknown,
    additionalKeys: string[] = []
): unknown {
    const SENSITIVE_KEYS = new Set(
        [...DEFAULT_SENSITIVE_KEYS, ...additionalKeys].map((k) => k.toLowerCase())
    );

    function _redact(v: unknown): unknown {
        if (v === null || v === undefined) return v;

        if (Array.isArray(v)) {
            return v.map((item) => _redact(item));
        }

        if (typeof v === "object") {
            const obj = v as Record<string, unknown>;
            const result: Record<string, unknown> = {};

            for (const [key, val] of Object.entries(obj)) {
                if (SENSITIVE_KEYS.has(key.toLowerCase())) {
                    result[key] = "****";
                } else {
                    result[key] = _redact(val);
                }
            }

            return result;
        }

        return v; // primitive
    }

    return _redact(value);
}


// Emojis for each log level
const LEVEL_ICONS: Record<string, string> = {
    info: "🟢",
    warn: "🟡",
    error: "🔴",
    debug: "🧪",
    http: "📨"
};

const colorizeLevel = (level: string) => {
    switch (level) {
        case "error": return chalk.red(level);
        case "warn": return chalk.yellow(level);
        case "info": return chalk.green(level);
        case "debug": return chalk.magenta(level);
        case "http": return chalk.cyan(level);
        default: return chalk.white(level);
    }
};

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
    const icon = LEVEL_ICONS[level] || "";
    const time = chalk.gray(timestamp);
    const lvl = colorizeLevel(level.toUpperCase());

    let output = `${icon}  ${time}  ${lvl}  ${message}`;

    // Only show extra meta prettified if available
    if (Object.keys(meta).length > 0) {
        const metaString = JSON.stringify(meta, null, 2)
            .replace(/"([^"]+)":/g, (_, key) => chalk.blue(key) + ":"); // color keys

        output += `\n${chalk.dim("━━━━━━━━ META ━━━━━━━━")}\n${metaString}`;
    }

    return output;
});

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(timestamp(), logFormat),
    transports: [
        new winston.transports.Console({
            handleExceptions: true
        })
    ]
});

export const log = {
    info: (msg: string, meta?: unknown) => logger.info(msg, meta),
    error: (msg: string, meta?: unknown) => logger.error(msg, meta),
    warn: (msg: string, meta?: unknown) => logger.warn(msg, meta),
    debug: (msg: string, meta?: unknown) => logger.debug(msg, meta),
    http: (msg: string, meta?: unknown) => logger.http?.(msg, meta) || logger.info(msg, meta)
};
