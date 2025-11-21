import crypto from "crypto";
import { Types } from "mongoose";
import { MerchantModel, IMerchant } from "../models/Merchant";
import { encryptSecret, decryptSecret } from "../security/encryption";

export class MerchantService {
    private static instance: MerchantService;

    private constructor() { }

    public static getInstance(): MerchantService {
        if (!MerchantService.instance) {
            MerchantService.instance = new MerchantService();
        }
        return MerchantService.instance;
    }

    private generateApiKey(): string {
        return "mpg_" + crypto.randomBytes(16).toString("hex");
    }

    private generateApiSecret(): string {
        return crypto.randomBytes(32).toString("hex");
    }

    /**
     * Create merchant for a specific user
     * Returns merchant + plaintext apiSecret (only once!)
     */
    public async createMerchantForUser(
        userId: string,
        businessName: string
    ): Promise<{ merchant: IMerchant; apiKey: string; apiSecretPlain: string }> {
        const userObjectId = new Types.ObjectId(userId);

        const existing = await MerchantModel.findOne({ user_id: userObjectId });
        if (existing) {
            throw Object.assign(new Error("Merchant already exists for this user"), {
                statusCode: 409
            });
        }

        const apiKey = this.generateApiKey();
        const apiSecretPlain = this.generateApiSecret();
        const encryptedSecret = encryptSecret(apiSecretPlain);

        const merchant = await MerchantModel.create({
            user_id: userObjectId,
            business_name: businessName,
            api_key: apiKey,
            api_secret: encryptedSecret,
            status: "active"
        });

        return { merchant, apiKey, apiSecretPlain };
    }

    public async getMerchantForUser(userId: string): Promise<IMerchant | null> {
        return MerchantModel.findOne({ user_id: userId }).exec();
    }

    public async getMerchantByApiKey(apiKey: string): Promise<IMerchant | null> {
        return MerchantModel.findOne({ api_key: apiKey }).select("+api_secret").exec();
    }

    public decryptApiSecret(encrypted: string): string {
        return decryptSecret(encrypted);
    }

    public async rotateApiCredentials(
        merchantId: string
    ): Promise<{ merchant: IMerchant; apiKey: string; apiSecretPlain: string }> {
        const merchant = await MerchantModel.findById(merchantId).select("+api_secret");
        if (!merchant) {
            throw Object.assign(new Error("Merchant not found"), { statusCode: 404 });
        }

        const apiKey = this.generateApiKey();
        const apiSecretPlain = this.generateApiSecret();
        const encryptedSecret = encryptSecret(apiSecretPlain);

        merchant.api_key = apiKey;
        merchant.api_secret = encryptedSecret;
        await merchant.save();

        return { merchant, apiKey, apiSecretPlain };
    }


    public async updateMerchantForUser(
        userId: string,
        updates: {
            business_name?: string;
            webhook_url?: string | null;
        }
    ) {
        const $set: Record<string, unknown> = {};
        if (updates.business_name !== undefined) {
            $set.business_name = updates.business_name;
        }
        if (updates.webhook_url !== undefined) {
            // allow user to clear webhook by sending null/empty string
            if (updates.webhook_url === null || updates.webhook_url.trim() === "") {
                $set.webhook_url = undefined;
            } else {
                $set.webhook_url = updates.webhook_url.trim();
            }
        }

        const merchant = await MerchantModel.findOneAndUpdate(
            { user_id: userId },
            { $set },
            { new: true }
        ).exec();

        if (!merchant) {
            throw Object.assign(new Error("Merchant not found for this user"), {
                statusCode: 404
            });
        }

        return merchant;
    }

}

export const merchantService = MerchantService.getInstance();
