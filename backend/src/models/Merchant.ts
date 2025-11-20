// src/models/Merchant.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IMerchant extends Document {
    user_id: Types.ObjectId;
    business_name: string;
    api_key: string;
    api_secret: string;
    status: "active" | "inactive" | "suspended";
    created_at: Date;
}

const merchantSchema = new Schema<IMerchant>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        business_name: {
            type: String,
            required: true,
            trim: true
        },
        api_key: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        api_secret: {
            type: String,
            required: true // ⚠ MUST BE ENCRYPTED AT REST
        },
        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
            index: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: false // merchants usually don’t change often
        }
    }
);

merchantSchema.index({ api_key: 1 });

export const MerchantModel = model<IMerchant>("Merchant", merchantSchema);
