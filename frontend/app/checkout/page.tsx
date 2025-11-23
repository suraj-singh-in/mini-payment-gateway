"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    InitCheckoutBody,
    createCheckoutSession,
    computeHmacSHA256,
} from "@/server-functions/checkoutService";

export default function DemoCheckoutPage() {
    const router = useRouter();

    const [apiKey, setApiKey] = useState("");
    const [apiSecret, setApiSecret] = useState("");
    const [amount, setAmount] = useState("1000");
    const [currency, setCurrency] = useState("INR");
    const [customerEmail, setCustomerEmail] = useState("test@example.com");
    const [orderId, setOrderId] = useState("ORD-123");

    const [signature, setSignature] = useState("");
    const [loading, setLoading] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    const handleCalculateSignature = async () => {
        setInitError(null);
        try {
            const body: InitCheckoutBody = {
                amount: Number(amount),
                currency,
                customer_email: customerEmail,
                metadata: { orderId },
            };

            const payload = JSON.stringify(body);
            const sig = await computeHmacSHA256(apiSecret, payload);
            setSignature(sig);
        } catch (err: any) {
            setInitError(err.message || "Failed to calculate signature");
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setInitError(null);

        const body: InitCheckoutBody = {
            amount: Number(amount),
            currency,
            customer_email: customerEmail,
            metadata: { orderId },
        };

        const result = await createCheckoutSession(apiKey, apiSecret, body);

        if (!result.ok || !result.data) {
            setInitError(result.error || "Checkout init failed");
            if (result.signature) setSignature(result.signature);
            setLoading(false);
            return;
        }

        // Save signature (for dev visibility)
        if (result.signature) setSignature(result.signature);

        // Redirect to dummy pay page
        const { checkout_session_id: sessionId } = result.data;
        router.push(`/checkout/${sessionId}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        Demo Checkout – Init Session
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Merchant credentials */}
                        <div className="space-y-2">
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="pk_live_..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apiSecret">API Secret</Label>
                            <Input
                                id="apiSecret"
                                type="password"
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                                placeholder="sk_live_..."
                                required
                            />
                        </div>

                        {/* Checkout payload */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (in paise)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min={1}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Input
                                    id="currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Customer Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="orderId">Order ID (metadata)</Label>
                            <Input
                                id="orderId"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>

                        {/* Signature UI */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label htmlFor="signature">HMAC Signature</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCalculateSignature}
                                >
                                    Calculate Signature
                                </Button>
                            </div>
                            <Input
                                id="signature"
                                value={signature}
                                readOnly
                                className="font-mono text-xs"
                                placeholder="Click 'Calculate Signature' to generate"
                            />
                        </div>

                        {initError && (
                            <p className="text-sm text-red-500">⚠ {initError}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating checkout session..." : "Start Checkout"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
