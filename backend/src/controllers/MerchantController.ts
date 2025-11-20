import { Response, NextFunction } from "express";
import { merchantService } from "../services/MerchantService";
import { LogRequest } from "../decorators/LogRequest";
import { AuthRequest } from "../middleware/requireAuth";

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
}

export const merchantController = MerchantController.getInstance();
