import { Response, NextFunction } from "express";
import { LogRequest } from "../decorators/LogRequest";
import { AuthRequest } from "../middleware/requireAuth";
import { transactionService } from "../services/TransactionService";
import { merchantService } from "../services/MerchantService";
import { decryptSecret } from "../security/encryption";
import { webhookService } from "../services/WebhookService";
import { MerchantModel } from "../models/Merchant";
import { hashUserAgent } from "../security/userAgent";
import {
    ValidateCheckoutInitRequest,
    ValidateProcessPaymentRequest
} from "../guards/TransactionGuards";
import { logger } from "../utils/logger";

export class TransactionController {
    private static instance: TransactionController;

    private constructor() { }

    public static getInstance(): TransactionController {
        if (!TransactionController.instance) {
            TransactionController.instance = new TransactionController();
        }
        return TransactionController.instance;
    }

    /**
     * Merchant-signed: Create checkout session
     * Protected with merchantHmacAuth (middleware attaches req.merchant)
     */
    @LogRequest({ label: "TransactionController.createCheckoutSession" })
    @ValidateCheckoutInitRequest()
    public async createCheckoutSession(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const merchant = (req as any).merchant;
            if (!merchant) {
                return res.status(401).json({ error: "Merchant not resolved" });
            }

            const { amount, currency, customer_email, metadata } = req.body;

            if (!amount || !currency || !customer_email) {
                return res.status(400).json({
                    error: "amount, currency and customer_email are required"
                });
            }

            const userAgentHeader = req.headers["user-agent"] as string | undefined;
            const userAgentHash = hashUserAgent(userAgentHeader);

            const session = await transactionService.createCheckoutSession({
                merchantId: merchant.id,
                amount,
                currency,
                customer_email,
                metadata,
                user_agent_hash: userAgentHash
            });

            res.cookie("pg_session", userAgentHash, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 30 * 60 * 1000
            });

            return res.status(201).json({
                checkout_session_id: session.id,
                amount: session.amount,
                currency: session.currency,
                status: session.status,
                expires_at: session.expires_at
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Public-ish: Process payment for a checkout session (mock)
     */
    @LogRequest({
        label: "TransactionController.processPayment",
        extraSensitiveFields: []
    })
    @ValidateProcessPaymentRequest()
    public async processPayment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { payment_method, amount } = req.body;

            if (!payment_method || typeof amount !== "number") {
                return res.status(400).json({
                    error: "payment_method and amount are required"
                });
            }

            const session = (req as any).checkoutSession;
            if (!session) {
                return res.status(500).json({ error: "Checkout session context missing" });
            }

            const merchant = await MerchantModel.findById(session.merchant_id).select(
                "+api_secret"
            );
            if (!merchant) {
                return res.status(500).json({ error: "Merchant for session not found" });
            }

            const encryptedSecret: string = merchant.api_secret;
            const secretPlain = decryptSecret(encryptedSecret);

            const { session: updatedSession, transaction } =
                await transactionService.processPayment({
                    checkoutSessionId: session.id,
                    payment_method,
                    amount,
                    merchantSecret: secretPlain
                });

            void webhookService.sendTransactionStatusWebhook({
                merchant,
                merchantSecretPlain: secretPlain,
                transaction,
                session: updatedSession
            });

            return res.status(201).json({
                transaction_id: transaction.id,
                status: transaction.status,
                checkout_session_id: updatedSession.id,
                amount: transaction.amount,
                currency: transaction.currency,
                payment_method: transaction.payment_method
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Merchant dashboard: list transactions
     * Uses JWT auth → derive merchant from user
     */
    @LogRequest({ label: "TransactionController.getTransactions" })
    public async getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const merchant = await merchantService.getMerchantForUser(req.user.id);
            if (!merchant) {
                return res.status(404).json({ error: "Merchant not found for this user" });
            }

            const { status, from, to, limit } = req.query;

            const fromDate = from ? new Date(String(from)) : undefined;
            const toDate = to ? new Date(String(to)) : undefined;
            const limitNum = limit ? Number(limit) : undefined;

            const txs = await transactionService.getTransactionsForMerchant({
                merchantId: merchant.id,
                status: status ? String(status) : undefined,
                from: fromDate,
                to: toDate,
                limit: limitNum
            });

            return res.json({
                count: txs.length,
                transactions: txs.map((t) => ({
                    id: t.id,
                    amount: t.amount,
                    currency: t.currency,
                    status: t.status,
                    customer_email: t.customer_email,
                    created_at: t.created_at
                }))
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Merchant dashboard: transaction details
     */
    @LogRequest({ label: "TransactionController.getTransactionDetails" })
    public async getTransactionDetails(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const merchant = await merchantService.getMerchantForUser(req.user.id);
            if (!merchant) {
                return res.status(404).json({ error: "Merchant not found for this user" });
            }

            const { id } = req.params;

            const tx = await transactionService.getTransactionForMerchant(merchant.id, id);
            if (!tx) {
                return res.status(404).json({ error: "Transaction not found" });
            }

            return res.json({
                id: tx.id,
                amount: tx.amount,
                currency: tx.currency,
                status: tx.status,
                customer_email: tx.customer_email,
                metadata: tx.metadata,
                payment_method: tx.payment_method,
                created_at: tx.created_at
            });
        } catch (err) {
            next(err);
        }
    }

    @LogRequest({ label: "TransactionController.getTransactionDetails" })
    public async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const merchant = await merchantService.getMerchantForUser(user.id);
            logger.info("merchant", merchant)
            if (!merchant) {
                return res.status(404).json({ error: "Merchant not found for this user" });
            }

            const analytics = await transactionService.getMerchantAnalytics(merchant.id);

            return res.json({
                last24h: {
                    totalVolume: analytics.last24h.totalVolume,
                    successfulPayments: analytics.last24h.successfulPayments,
                    failedPayments: analytics.last24h.failedPayments,
                    conversionRate: analytics.last24h.conversionRate
                },
                last7d: {
                    totalVolume: analytics.last7d.totalVolume,
                    successfulPayments: analytics.last7d.successfulPayments,
                    failedPayments: analytics.last7d.failedPayments,
                    conversionRate: analytics.last7d.conversionRate
                }
            });
        } catch (err) {
            next(err);
        }
    }

}

export const transactionController = TransactionController.getInstance();
