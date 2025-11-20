import { Schema, model, Document, Types } from "mongoose";

export interface ITransaction extends Document {
    merchant_id: Types.ObjectId;
    amount: number;
    currency: string;
    status: "pending" | "success" | "failed";
    customer_email: string;
    metadata?: Record<string, unknown>;
    signature: string;
    created_at: Date;
}

const transactionSchema = new Schema<ITransaction>(
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
            enum: ["pending", "success", "failed"],
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
            type: Schema.Types.Mixed // supports any JSON (good for optional data)
        },
        signature: {
            type: String,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: false // transactions should be immutable
        }
    }
);

// Index for analytics (date + merchant + status)
transactionSchema.index({ merchant_id: 1, status: 1, created_at: -1 });

export const TransactionModel = model<ITransaction>(
    "Transaction",
    transactionSchema
);
