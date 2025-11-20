// src/models/RefreshToken.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IRefreshToken extends Document {
    user_id: Types.ObjectId;
    token_hash: string;
    jti: string;
    revoked: boolean;
    expires_at: Date;
    created_at: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        token_hash: {
            type: String,
            required: true
        },
        jti: {
            type: String,
            required: true,
            index: true
        },
        revoked: {
            type: Boolean,
            default: false
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
            updatedAt: false
        }
    }
);

refreshTokenSchema.index({ user_id: 1, jti: 1 });

export const RefreshTokenModel = model<IRefreshToken>(
    "RefreshToken",
    refreshTokenSchema
);
