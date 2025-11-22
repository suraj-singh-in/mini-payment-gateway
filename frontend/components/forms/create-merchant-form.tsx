"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createMerchant } from "@/server-functions/merchantService";
import { useDashboard } from "@/contexts/dashboard-context";

export function CreateMerchantForm() {
    const { setMerchant } = useDashboard();

    const [businessName, setBusinessName] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [credentials, setCredentials] = useState<{
        api_key: string;
        api_secret: string;
    } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // backend expects businessName; if you also support webhook here,
            // update your server function to forward webhook_url
            const res = await createMerchant(businessName);

            if (!res.success) {
                setError(res.message || "Failed to create merchant");
                return;
            }

            if (res.data?.merchant) {
                setMerchant(res.data.merchant);
            }

            if (res.data?.credentials) {
                setCredentials(res.data.credentials);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create your merchant</CardTitle>
                <p className="text-sm text-muted-foreground">
                    You don&apos;t have a merchant yet. Create one to start using the Mini
                    Payment Gateway.
                </p>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="businessName">
                            Business name
                        </label>
                        <Input
                            id="businessName"
                            placeholder="My Cool Store"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="webhookUrl">
                            Webhook URL (optional)
                        </label>
                        <Input
                            id="webhookUrl"
                            placeholder="https://example.com/payment-webhook"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            You can also configure this later from Settings.
                        </p>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create merchant"}
                    </Button>
                </form>

                {credentials && (
                    <div className="mt-6 space-y-2 rounded-md border bg-muted/40 p-3 text-xs">
                        <p className="font-semibold">
                            Store these credentials safely (shown only once):
                        </p>
                        <p>
                            <span className="font-mono font-semibold">API Key:</span>{" "}
                            {credentials.api_key}
                        </p>
                        <p>
                            <span className="font-mono font-semibold">API Secret:</span>{" "}
                            {credentials.api_secret}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
