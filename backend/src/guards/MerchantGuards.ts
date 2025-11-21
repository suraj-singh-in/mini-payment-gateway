import { z } from "zod";
import { RequestValidationGuard } from "./RequestValidation";

/**
 * POST /api/merchants
 * Body: { businessName }
 */
export function ValidateCreateMerchantRequest() {
    const bodySchema = z.object({
        businessName: z
            .string()
            .min(2, "businessName must be at least 2 characters")
    });

    return RequestValidationGuard({
        bodySchema
    });
}

/**
 * PATCH /api/merchants/me
 * Body: { business_name?, webhook_url? }
 * At least one must be present.
 */
export function ValidateUpdateMerchantRequest() {
    const bodySchema = z
        .object({
            business_name: z.string().min(2, "business_name must be at least 2 characters").optional(),
            webhook_url: z
                .string()
                .url("webhook_url must be a valid URL")
                .optional()
        })
        .refine(
            (val) =>
                val.business_name !== undefined || val.webhook_url !== undefined,
            {
                message:
                    "At least one of business_name or webhook_url must be provided"
            }
        );

    return RequestValidationGuard({
        bodySchema
    });
}
