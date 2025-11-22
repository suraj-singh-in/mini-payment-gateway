import { Response, NextFunction } from "express";
import { merchantService } from "../services/MerchantService";
import { LogRequest } from "../decorators/LogRequest";
import { AuthRequest } from "../middleware/requireAuth";
import {
    ValidateCreateMerchantRequest,
    ValidateUpdateMerchantRequest
} from "../guards/MerchantGuards";

export class MerchantController {
    private static instance: MerchantController;

    private constructor() { }

    public static getInstance(): MerchantController {
        if (!MerchantController.instance) {
            MerchantController.instance = new MerchantController();
        }
        return MerchantController.instance;
    }

    @LogRequest({ label: "MerchantController.createMerchant", extraSensitiveFields: [] })
    @ValidateCreateMerchantRequest()
    public async createMerchant(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const { businessName } = req.body;
            if (!businessName) {
                return res.status(400).json({ error: "businessName is required" });
            }

            const { merchant, apiKey, apiSecretPlain } =
                await merchantService.createMerchantForUser(req.user.id, businessName);

            // NOTE: apiSecretPlain is returned ONLY ONCE here
            return res.status(201).json({
                merchant: {
                    id: merchant.id,
                    business_name: merchant.business_name,
                    status: merchant.status,
                    api_key: apiKey
                },
                credentials: {
                    api_key: apiKey,
                    api_secret: apiSecretPlain
                }
            });
        } catch (err) {
            next(err);
        }
    }

    @LogRequest({ label: "MerchantController.getMyMerchant" })
    public async getMyMerchant(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const merchant = await merchantService.getMerchantForUser(req.user.id);
            if (!merchant) {
                return res.status(404).json({ error: "Merchant not found" });
            }

            return res.json({
                id: merchant.id,
                business_name: merchant.business_name,
                status: merchant.status,
                api_key: merchant.api_key
            });
        } catch (err) {
            next(err);
        }
    }

    @LogRequest({
        label: "MerchantController.updateMyMerchant",
        extraSensitiveFields: []
    })
    public async updateMyMerchant(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const { business_name, webhook_url } = req.body;

            if (
                business_name === undefined &&
                webhook_url === undefined
            ) {
                return res.status(400).json({
                    error: "At least one field (business_name or webhook_url) must be provided"
                });
            }

            // simple optional URL sanity check
            if (webhook_url) {
                try {
                    // this throws if invalid URL
                    new URL(webhook_url);
                } catch {
                    return res.status(400).json({ error: "Invalid webhook_url" });
                }
            }

            const merchant = await merchantService.updateMerchantForUser(req.user.id, {
                business_name,
                webhook_url
            });

            return res.json({
                id: merchant.id,
                business_name: merchant.business_name,
                api_key: merchant.api_key,
                status: merchant.status,
                webhook_url: merchant.webhook_url ?? null
            });
        } catch (err) {
            next(err);
        }
    }
}

export const merchantController = MerchantController.getInstance();
