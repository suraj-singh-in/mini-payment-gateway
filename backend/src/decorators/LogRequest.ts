// src/decorators/LogRequest.ts
import { Request, Response, NextFunction } from "express";
import { log, redactSensitive } from "../utils/logger";
import { randomUUID } from "crypto";

export interface LogRequestOptions {
    extraSensitiveFields?: string[];
    label?: string;
}

const headerMeta: Record<string, unknown> = {};

/**
 * Method decorator for Express route handlers.
 *
 * Usage:
 *   @LogRequest({ extraSensitiveFields: ["email"] })
 *   async login(req: Request, res: Response, next: NextFunction) { ... }
 */
export function LogRequest(options: LogRequestOptions = {}): MethodDecorator {
    const { extraSensitiveFields = [], label } = options;

    return function (
        target: unknown,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;

        if (typeof originalMethod !== "function") {
            throw new Error("@LogRequest can only be used on methods");
        }

        descriptor.value = async function (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<unknown> {
            const handlerName =
                label || `${target && (target as any).constructor?.name || "Unknown"}.${String(propertyKey)}`;

            // Use traceId from basicRequestLogger if set, else create one
            const traceId =
                (req as any).traceId ?? randomUUID();

            const metaBase = {
                traceId,
                handler: handlerName,
                method: req.method,
                url: req.originalUrl
            };

            if (req.headers["user-agent"]) {
                headerMeta["user-agent"] = req.headers["user-agent"];
            }

            if (req.headers["content-type"]) {
                headerMeta["content-type"] = req.headers["content-type"];
            }

            // Only include authorization if it actually exists
            if (req.headers["authorization"]) {
                headerMeta["authorization"] = req.headers["authorization"];
            }

            const incoming = {
                body: redactSensitive(req.body, extraSensitiveFields),
                query: redactSensitive(req.query, extraSensitiveFields),
                params: redactSensitive(req.params, extraSensitiveFields),
                headers: redactSensitive(headerMeta, extraSensitiveFields)
            };

            log.debug("Handler input", { ...metaBase, incoming });

            // Monkey-patch res.json to log outgoing data
            const originalJson = res.json.bind(res);

            res.json = (body: any): Response => {
                const redactedResponse = redactSensitive(body, extraSensitiveFields);

                log.debug("Handler output", {
                    ...metaBase,
                    statusCode: res.statusCode,
                    response: redactedResponse
                });

                // restore and call original
                res.json = originalJson;
                return originalJson(body);
            };

            try {
                // Call original handler
                return await originalMethod.call(this, req, res, next);
            } catch (err) {
                log.error("Handler threw error", {
                    ...metaBase,
                    error: (err as Error).message
                });
                // restore json in case error handler wants to use it
                res.json = originalJson;
                throw err;
            }
        };

        return descriptor;
    };
}
