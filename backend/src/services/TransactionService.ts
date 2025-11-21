import { Types } from "mongoose";
import { CheckoutSessionModel, ICheckoutSession } from "../models/CheckoutSession";
import { ITransaction, TransactionModel } from "../models/Transaction";
import { computeHmac } from "../security/hmac";

export class TransactionService {
    private static instance: TransactionService;

    private constructor() { }

    public static getInstance(): TransactionService {
        if (!TransactionService.instance) {
            TransactionService.instance = new TransactionService();
        }
        return TransactionService.instance;
    }

    /**
     * Creates a checkout session for a merchant
     */
    public async createCheckoutSession(params: {
        merchantId: string;
        amount: number;
        currency: string;
        customer_email: string;
        metadata?: Record<string, unknown>;
        expiryMinutes?: number;
    }): Promise<ICheckoutSession> {
        const { merchantId, amount, currency, customer_email, metadata, expiryMinutes = 30 } =
            params;

        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        const session = await CheckoutSessionModel.create({
            merchant_id: new Types.ObjectId(merchantId),
            amount,
            currency,
            customer_email,
            metadata,
            status: "pending",
            expires_at: expiresAt
        });

        return session;
    }

    /**
     * Process payment for a checkout session (mock)
     */
    public async processPayment(params: {
        checkoutSessionId: string;
        payment_method: string;
        amount: number;
        // merchant's api_secret (plain) used to sign transaction record
        merchantSecret: string;
    }): Promise<{ session: ICheckoutSession; transaction: ITransaction }> {
        const { checkoutSessionId, payment_method, amount, merchantSecret } = params;

        const session = await CheckoutSessionModel.findById(checkoutSessionId);
        if (!session) {
            throw Object.assign(new Error("Checkout session not found"), {
                statusCode: 404
            });
        }

        if (session.status !== "pending") {
            throw Object.assign(new Error("Checkout session is not pending"), {
                statusCode: 400
            });
        }

        if (session.expires_at.getTime() < Date.now()) {
            session.status = "expired";
            await session.save();
            throw Object.assign(new Error("Checkout session expired"), {
                statusCode: 400
            });
        }

        if (amount !== session.amount) {
            throw Object.assign(new Error("Amount mismatch with checkout session"), {
                statusCode: 400
            });
        }

        // Mock processing: here we just mark everything as success for now.
        const success = true; // later, you can randomize or simulate failures

        // Signature – for auditing/verification
        const signingPayload = {
            checkout_session_id: session.id,
            amount: session.amount,
            currency: session.currency,
            customer_email: session.customer_email,
            payment_method
        };

        const signingString = JSON.stringify(signingPayload);
        const signature = computeHmac(signingString, merchantSecret);

        const transaction = await TransactionModel.create({
            merchant_id: session.merchant_id,
            checkout_session_id: session._id,
            amount: session.amount,
            currency: session.currency,
            status: success ? "success" : "failed",
            customer_email: session.customer_email,
            metadata: session.metadata,
            signature,
            payment_method
        });

        session.status = success ? "completed" : "failed";
        await session.save();

        return { session, transaction };
    }

    public async getTransactionForMerchant(
        merchantId: string,
        transactionId: string
    ): Promise<ITransaction | null> {
        return TransactionModel.findOne({
            _id: transactionId,
            merchant_id: merchantId
        }).exec();
    }

    public async getTransactionsForMerchant(params: {
        merchantId: string;
        status?: string;
        from?: Date;
        to?: Date;
        limit?: number;
    }): Promise<ITransaction[]> {
        const { merchantId, status, from, to, limit = 50 } = params;

        const query: Record<string, unknown> = {
            merchant_id: new Types.ObjectId(merchantId)
        };

        if (status) {
            query.status = status;
        }

        if (from || to) {
            query.created_at = {};
            if (from) (query.created_at as any).$gte = from;
            if (to) (query.created_at as any).$lte = to;
        }

        return TransactionModel.find(query)
            .sort({ created_at: -1 })
            .limit(limit)
            .exec();
    }
}

export const transactionService = TransactionService.getInstance();
