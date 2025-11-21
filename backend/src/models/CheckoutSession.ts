import { Schema, model, Document, Types } from "mongoose";

export type CheckoutSessionStatus =
    | "pending"
    | "completed"
    | "failed"
    | "expired"
    | "cancelled";

export interface ICheckoutSession extends Document {
    merchant_id: Types.ObjectId;
    amount: number;
    currency: string;
    status: CheckoutSessionStatus;
    customer_email: string;
    metadata?: Record<string, unknown>;
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
}

const checkoutSessionSchema = new Schema<ICheckoutSession>(
    {
        merchant_id: {
            type: Schema.Types.ObjectId,
            ref: "Merchant",
            required: true,
            index: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "expired", "cancelled"],
            default: "pending",
            index: true
        },
        customer_email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        metadata: {
            type: Schema.Types.Mixed
        },
        expires_at: {
            type: Date,
            required: true,
            index: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

checkoutSessionSchema.index({ merchant_id: 1, created_at: -1 });

export const CheckoutSessionModel = model<ICheckoutSession>(
    "CheckoutSession",
    checkoutSessionSchema
);
