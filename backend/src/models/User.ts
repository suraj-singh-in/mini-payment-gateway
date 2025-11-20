import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    password_hash: string;
    role: "admin" | "merchant" | "user";
    created_at: Date;
    updated_at: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password_hash: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["admin", "merchant", "user"],
            default: "user",
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

// Index for faster login lookups
userSchema.index({ email: 1 });

export const UserModel = model<IUser>("User", userSchema);
