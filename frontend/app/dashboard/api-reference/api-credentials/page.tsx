"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner"

import { getMerchantCredentials } from "@/server-functions/merchantService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/contexts/dashboard-context";

export default function MerchantCredentialsPage() {
    const { user } = useDashboard();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Copy API key
    const copyToClipboard = async () => {
        if (data?.api_key) {
            await navigator.clipboard.writeText(data.api_key);
            toast("API Key copied to clipboard!");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const res = await getMerchantCredentials();
            if (res.success) setData(res.data);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (!user) return <p>Unauthorized</p>;
    if (loading) return <p>Loading credentials…</p>;
    if (!data) return <p>No credentials found</p>;

    return (
        <div className="m-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Merchant Credentials</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Business Name</p>
                        <p className="text-lg font-semibold">{data.business_name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Merchant ID</p>
                        <p className="text-lg font-medium">{data.merchant_id}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground mb-1">API Key</p>
                        <div className="flex gap-2">
                            <Input value={data.api_key} readOnly className="font-mono" />
                            <Button onClick={copyToClipboard} variant="secondary">
                                Copy
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
