// src/services/webhookService.ts
import axios from "axios";
import { IMerchant } from "../models/Merchant";
import { ITransaction } from "../models/Transaction";
import { ICheckoutSession } from "../models/CheckoutSession";
import { buildSigningString, computeHmac } from "../security/hmac";
import { log } from "../utils/logger";

export class WebhookService {
    private static instance: WebhookService;

    private constructor() { }

    public static getInstance(): WebhookService {
        if (!WebhookService.instance) {
            WebhookService.instance = new WebhookService();
        }
        return WebhookService.instance;
    }

    /**
     * Fire-and-forget webhook. Errors are logged but do NOT affect transaction status.
     *
     * @param merchant merchant doc (with webhook_url)
     * @param merchantSecretPlain decrypted api_secret
     */
    public async sendTransactionStatusWebhook(params: {
        merchant: IMerchant;
        merchantSecretPlain: string;
        transaction: ITransaction;
        session?: ICheckoutSession;
    }): Promise<void> {
        const { merchant, merchantSecretPlain, transaction, session } = params;

        if (!merchant.webhook_url) {
            return; // no webhook configured
        }

        const url = merchant.webhook_url;

        const payload = {
            event: "transaction.updated",
            data: {
                transaction: {
                    id: transaction.id,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    status: transaction.status,
                    customer_email: transaction.customer_email,
                    payment_method: transaction.payment_method,
                    metadata: transaction.metadata,
                    created_at: transaction.created_at
                },
                checkout_session: session
                    ? {
                        id: session.id,
                        status: session.status,
                        amount: session.amount,
                        currency: session.currency,
                        customer_email: session.customer_email,
                        metadata: session.metadata
                    }
                    : undefined
            }
        };

        const timestamp = Date.now().toString();
        const signingString = buildSigningString(timestamp, payload);
        const signature = computeHmac(signingString, merchantSecretPlain);

        try {
            await axios.post(url, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "x-webhook-timestamp": timestamp,
                    "x-webhook-signature": signature
                },
                timeout: 5000
            });

            log.info("Webhook delivered", {
                merchantId: merchant.id,
                url,
                event: payload.event
            });
        } catch (err: any) {
            log.warn("Failed to deliver webhook", {
                merchantId: merchant.id,
                url,
                event: payload.event,
                error: err?.message
            });
        }
    }
}

export const webhookService = WebhookService.getInstance();
