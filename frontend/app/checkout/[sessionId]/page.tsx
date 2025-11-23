// app/checkout/[sessionId]/pay/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
    getCheckoutSession,
    payCheckoutSession,
    CheckoutSession,
    PayResult,
} from "@/server-functions/checkoutService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckoutPayPage() {
    const params = useParams<{ sessionId: string }>();
    const sessionId = params.sessionId;

    const [session, setSession] = useState<CheckoutSession | null>(null);
    const [sessionLoading, setSessionLoading] = useState(true);
    const [sessionError, setSessionError] = useState<string | null>(null);

    const [payLoading, setPayLoading] = useState<"success" | "fail" | null>(null);
    const [payError, setPayError] = useState<string | null>(null);
    const [payResult, setPayResult] = useState<PayResult | null>(null);

    // Load checkout session on mount
    useEffect(() => {
        if (!sessionId) return;

        const fetchSession = async () => {
            setSessionLoading(true);
            setSessionError(null);

            const res = await getCheckoutSession(sessionId as string);
            if (res.ok && res.data) {
                setSession(res.data);
            } else {
                setSession(null);
                setSessionError(res.error || "Failed to load checkout session");
            }

            setSessionLoading(false);
        };

        fetchSession();
    }, [sessionId]);

    const handleSimulatePay = async (status: "success" | "fail") => {
        if (!session) return;

        const res = await payCheckoutSession(sessionId, status, {
            paymentMethod: "card",    // or razorpay, upi, etc.
            amount: session.amount,   // use amount from checkoutSession
        });

        if (!res.ok) {
            console.log(res.validationErrors); // show nicely in UI if you want
            setPayError(
                res.validationErrors
                    ? res.validationErrors.map((v) => `${v.path}: ${v.message}`).join("\n")
                    : res.error || "Payment failed"
            );
            return;
        }

        setPayResult(res.data!);
    };


    const showResult = !!payResult;
    const isSuccess = payResult?.status === "success";

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-lg">
                <CardContent>
                    {/* 🔥 If payment is successful — ONLY show success view */}
                    {isSuccess ? (
                        <div className="space-y-4 text-center py-6">
                            <h2 className="text-2xl font-bold text-green-600">Payment Succeeded 🎉</h2>

                            <pre className="text-xs bg-muted rounded p-2 overflow-auto text-left">
                                {JSON.stringify(payResult, null, 2)}
                            </pre>

                            <Button
                                onClick={() => window.location.href = "/checkout"} // OR redirect to merchant dashboard
                                className="mt-4"
                            >
                                Back to Home
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Old UI here (session + buttons + error + result) */}
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Demo Checkout – Pay</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <p className="text-xs text-muted-foreground">
                                    Session ID: <span className="font-mono">{sessionId}</span>
                                </p>

                                {sessionLoading && (
                                    <p className="text-sm text-muted-foreground">Loading checkout session…</p>
                                )}

                                {sessionError && (
                                    <p className="text-sm text-red-500">⚠ {sessionError}</p>
                                )}

                                {session && !sessionLoading && (
                                    <div className="space-y-2 border rounded p-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Merchant ID</span>
                                            <span className="font-mono">{session.merchant_id}</span>
                                        </div>
                                        {session.merchant_name && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Merchant Name</span>
                                                <span>{session.merchant_name}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Amount</span>
                                            <span className="font-semibold">
                                                {session.amount / 100} {session.currency}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="capitalize">{session.status}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1"
                                        variant="default"
                                        onClick={() => handleSimulatePay("success")}
                                        disabled={payLoading !== null || !session}
                                    >
                                        {payLoading === "success" ? "Processing…" : "Simulate Success"}
                                    </Button>

                                    <Button
                                        className="flex-1"
                                        variant="outline"
                                        onClick={() => handleSimulatePay("fail")}
                                        disabled={payLoading !== null || !session}
                                    >
                                        {payLoading === "fail" ? "Processing…" : "Simulate Failure"}
                                    </Button>
                                </div>

                                {payError && (
                                    <p className="text-sm text-red-500">⚠ {payError}</p>
                                )}

                                {showResult && !isSuccess && (
                                    <div className="mt-4 space-y-2">
                                        <p className={`font-semibold ${isSuccess ? "text-green-600" : "text-red-600"}`}>
                                            Payment Failed ❌
                                        </p>
                                        <pre className="text-xs bg-muted rounded p-2 overflow-auto">
                                            {JSON.stringify(payResult, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </CardContent>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );

}
