// src/guards/TransactionGuards.ts
import { z } from "zod";
import { RequestValidationGuard } from "./RequestValidation";

export function ValidateCheckoutInitRequest() {
    const headersSchema = z
        .object({
            "x-api-key": z.string().min(1, "x-api-key is required"),
            "x-timestamp": z.string().min(1, "x-timestamp is required"),
            "x-signature": z.string().min(1, "x-signature is required")
        })
        .passthrough();

    const bodySchema = z.object({
        amount: z.number().positive("amount must be > 0"),
        currency: z
            .string()
            .min(3, "currency must be a 3-letter code")
            .max(3, "currency must be a 3-letter code")
            .transform((c) => c.toUpperCase()),
        customer_email: z
            .string()
            .email("customer_email must be a valid email"),
        metadata: z.record(z.string(), z.any()).optional()
    });

    return RequestValidationGuard({
        headersSchema,
        bodySchema
    });
}

export function ValidateProcessPaymentRequest() {
    const bodySchema = z.object({
        payment_method: z
            .string()
            .min(1, "payment_method is required"),
        amount: z
            .number()
            .positive("amount must be > 0")
    });

    return RequestValidationGuard({
        bodySchema
    });
}
