// checkout/lib/checkout-service.ts
import axios from "axios";

const CHECKOUT_API_BASE =
    process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL || "http://localhost:8080/api/transactions";

// Create a reusable axios instance
const checkoutClient = axios.create({
    baseURL: CHECKOUT_API_BASE,
    withCredentials: true,
});

// ---- Types ----

export type InitCheckoutBody = {
    amount: number;
    currency: string;
    customer_email: string;
    metadata?: Record<string, any>;
    timestamp?: string;
};

export type InitCheckoutResponse = {
    checkout_session_id: string;
    amount: number;
    currency: string;
    status: string;
    expiresAt: any;
};

export type PayResult = {
    status: string; // "succeeded" | "failed" | etc.
    transactionId?: string;
    [key: string]: any;
};

export type CheckoutSession = {
    id: string;
    merchant_id: string;
    merchant_name?: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    expires_at?: any;
};

type ValidationDetail = {
    path: string;
    message: string;
};

export async function computeHmacSHA256(
    secret: string,
    payload: string
): Promise<string> {
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, enc.encode(payload));

    return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}



// ---------------------------
// MAIN FUNCTION FOR CHECKOUT
// ---------------------------
export async function createCheckoutSession(
    apiKey: string,
    apiSecret: string,
    body: InitCheckoutBody
): Promise<{
    ok: boolean;
    data?: InitCheckoutResponse;
    error?: string;
    signature?: string;
}> {
    try {
        const timestamp = Date.now().toString();
        const payload = `${timestamp}.${JSON.stringify(body)}`;
        const signature = await computeHmacSHA256(apiSecret, payload);

        const res = await checkoutClient.post<InitCheckoutResponse>(
            `/checkout/init`,
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "x-timestamp": timestamp,
                    "x-signature": signature,
                },
            }
        );

        return { ok: true, data: res.data, signature };
    } catch (err: any) {
        const status = err?.response?.status;
        const error = err?.response?.data?.error || err.message;
        return { ok: false, error: `${error} (status ${status})`, signature: undefined };
    }
}


export async function payCheckoutSession(
    sessionId: string,
    demoStatus: "success" | "fail",
    payload: { paymentMethod: string; amount: number }
): Promise<{
    ok: boolean;
    data?: PayResult;
    error?: string;
    validationErrors?: ValidationDetail[];
}> {
    try {
        const res = await checkoutClient.post<PayResult>(
            `/checkout/${sessionId}/pay`,
            {
                payment_method: payload.paymentMethod,
                amount: payload.amount,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Demo-Status": demoStatus, // still used by backend
                },
            }
        );

        return { ok: true, data: res.data };
    } catch (err: any) {
        const status = err?.response?.status;
        const errJson = err?.response?.data || {};

        const validationErrors: ValidationDetail[] | undefined = Array.isArray(
            errJson.details
        )
            ? errJson.details.map((d: any) => ({
                path: String(d.path),
                message: String(d.message),
            }))
            : undefined;

        return {
            ok: false,
            error:
                errJson.error ||
                err?.message ||
                `Pay failed with status ${status}`,
            validationErrors,
        };
    }
}


export async function getCheckoutSession(
    sessionId: string
): Promise<{ ok: boolean; data?: CheckoutSession; error?: string }> {
    try {
        const res = await checkoutClient.get<CheckoutSession>(
            `/checkout/${sessionId}/pay`
        );

        return { ok: true, data: res.data };
    } catch (err: any) {
        const status = err?.response?.status;
        const error = err?.response?.data?.error || err.message;
        return {
            ok: false,
            error: `${error} (status ${status})`,
        };
    }
}
