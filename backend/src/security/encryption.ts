// src/security/encryption.ts
import crypto from "crypto";
import { config } from "../config";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
    const base64 = config.encryptionKey;
    const key = Buffer.from(base64, "base64");
    if (key.length !== 32) {
        throw new Error("ENCRYPTION_KEY must be 32 bytes (base64 of 32 bytes)");
    }
    return key;
}

export function encryptSecret(plain: string): string {
    const key = getKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, key, iv);

    const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Format: iv:cipher:tag (all base64)
    return [
        iv.toString("base64"),
        encrypted.toString("base64"),
        tag.toString("base64")
    ].join(":");
}

export function decryptSecret(cipherText: string): string {
    const key = getKey();
    const [ivB64, dataB64, tagB64] = cipherText.split(":");
    if (!ivB64 || !dataB64 || !tagB64) {
        throw new Error("Invalid encrypted secret format");
    }

    const iv = Buffer.from(ivB64, "base64");
    const data = Buffer.from(dataB64, "base64");
    const tag = Buffer.from(tagB64, "base64");

    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString("utf8");
}
