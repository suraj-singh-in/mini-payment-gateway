// src/guards/RequestValidation.ts
import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodTypeAny } from "zod";

export interface RequestValidationConfig {
    headersSchema?: ZodTypeAny;
    bodySchema?: ZodTypeAny;
    querySchema?: ZodTypeAny;
}

function formatZodError(err: ZodError) {
    return err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
    }));
}

/**
 * RequestValidationGuard
 *
 * Usage:
 *   @RequestValidationGuard({
 *     bodySchema: z.object({ ... }),
 *     headersSchema: z.object({ ... }),
 *     querySchema: z.object({ ... })
 *   })
 */
export function RequestValidationGuard(config: RequestValidationConfig) {
    return function (
        _target: unknown,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const original = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            const req = args[0] as Request;
            const res = args[1] as Response;
            const next = args[2] as NextFunction;

            try {
                // headers
                if (config.headersSchema) {
                    const parsed = config.headersSchema.parse(req.headers);
                    (req as any).validatedHeaders = parsed;
                }

                // query
                if (config.querySchema) {
                    const parsed = config.querySchema.parse(req.query);
                    (req as any).validatedQuery = parsed;
                }

                // body
                if (config.bodySchema) {
                    const parsed = config.bodySchema.parse(req.body);
                    (req as any).validatedBody = parsed;
                    (req as any).body = parsed; // overwrite body with validated data
                }

                return await original.apply(this, args);
            } catch (err) {
                if (err instanceof ZodError) {
                    return res.status(400).json({
                        error: "Request validation failed",
                        details: formatZodError(err)
                    });
                }

                return next(err);
            }
        };

        return descriptor;
    };
}
