import mongoose, { Types } from "mongoose";
import { CheckoutSessionModel, ICheckoutSession } from "../models/CheckoutSession";
import { ITransaction, TransactionModel } from "../models/Transaction";
import { computeHmac } from "../security/hmac";

export interface WindowAnalytics {
    totalVolume: number;
    successfulPayments: number;
    failedPayments: number;
    conversionRate: number; // percentage, e.g. 93.3
}

export interface MerchantAnalytics {
    last24h: WindowAnalytics;
    last7d: WindowAnalytics;
}

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
        user_agent_hash: string;
    }): Promise<ICheckoutSession> {
        const {
            merchantId,
            amount,
            currency,
            customer_email,
            metadata,
            expiryMinutes = 30,
            user_agent_hash
        } = params;

        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        const session = await CheckoutSessionModel.create({
            merchant_id: new Types.ObjectId(merchantId),
            amount,
            currency,
            customer_email,
            metadata,
            status: "pending",
            expires_at: expiresAt,
            user_agent_hash
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

    public async getMerchantAnalytics(merchantId: string): Promise<MerchantAnalytics> {
        const now = new Date();

        const last24hDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);    // 24 hours
        const last7dDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days

        const [result] = await TransactionModel.aggregate([
            {
                $match: {
                    merchant_id: new mongoose.Types.ObjectId(merchantId)
                }
            },
            {
                $facet: {
                    last24h: [
                        {
                            $match: {
                                created_at: { $gte: last24hDate }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalVolume: { $sum: "$amount" },
                                successfulPayments: {
                                    $sum: {
                                        $cond: [{ $eq: ["$status", "success"] }, 1, 0]
                                    }
                                },
                                failedPayments: {
                                    $sum: {
                                        $cond: [{ $eq: ["$status", "failed"] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ],
                    last7d: [
                        {
                            $match: {
                                created_at: { $gte: last7dDate }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalVolume: { $sum: "$amount" },
                                successfulPayments: {
                                    $sum: {
                                        $cond: [{ $eq: ["$status", "success"] }, 1, 0]
                                    }
                                },
                                failedPayments: {
                                    $sum: {
                                        $cond: [{ $eq: ["$status", "failed"] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const raw24 = result?.last24h?.[0] ?? {
            totalVolume: 0,
            successfulPayments: 0,
            failedPayments: 0
        };

        const raw7 = result?.last7d?.[0] ?? {
            totalVolume: 0,
            successfulPayments: 0,
            failedPayments: 0
        };

        const computeConversion = (success: number, failed: number): number => {
            const total = success + failed;
            if (total === 0) return 0;
            return (success / total) * 100;
        };

        const last24h: WindowAnalytics = {
            totalVolume: raw24.totalVolume ?? 0,
            successfulPayments: raw24.successfulPayments ?? 0,
            failedPayments: raw24.failedPayments ?? 0,
            conversionRate: computeConversion(
                raw24.successfulPayments ?? 0,
                raw24.failedPayments ?? 0
            )
        };

        const last7d: WindowAnalytics = {
            totalVolume: raw7.totalVolume ?? 0,
            successfulPayments: raw7.successfulPayments ?? 0,
            failedPayments: raw7.failedPayments ?? 0,
            conversionRate: computeConversion(
                raw7.successfulPayments ?? 0,
                raw7.failedPayments ?? 0
            )
        };

        return { last24h, last7d };
    }
}

export const transactionService = TransactionService.getInstance();
