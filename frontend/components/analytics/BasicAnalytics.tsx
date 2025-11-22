"use client";

import { useEffect, useState } from "react";
import { MerchantAnalytics, Merchant } from "@/types";
import { getAnalytics } from "@/server-functions/transactionService";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function ({ merchant }: { merchant: Merchant }) {
    const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true);
            const res = await getAnalytics();
            if (res.success) {
                setAnalytics(res.data);
            } else {
                setError(res.message);
                setAnalytics(null);
            }
            setLoading(false);
        }

        fetchAnalytics();
    }, []);

    if (loading) return <p className="text-sm">Loading analytics…</p>;
    if (error) return <p className="text-red-500 text-sm">⚠ {error}</p>;
    if (!analytics) return <p>No analytics available.</p>;

    return <BasicAnalyticsList merchant={merchant} analytics={analytics} />;
}


export function BasicAnalyticsList({
    merchant,
    analytics,
}: {
    merchant: Merchant;
    analytics: MerchantAnalytics;
}) {
    const stats = [
        { label: "Total Volume (last 24h)", value: `₹${analytics?.last24h?.totalVolume}` },
        { label: "Successful Payments (last 24h)", value: analytics?.last24h?.successfulPayments },
        { label: "Failed Payments (last 24h)", value: analytics?.last24h?.failedPayments },
        { label: "Conversion Rate (last 24h)", value: `${analytics?.last24h?.conversionRate}%` },

        { label: "Total Volume (last 7d)", value: `₹${analytics?.last7d?.totalVolume}` },
        { label: "Successful Payments (last 7d)", value: analytics?.last7d?.successfulPayments },
        { label: "Failed Payments (last 7d)", value: analytics?.last7d?.failedPayments },
        { label: "Conversion Rate (last 7d)", value: `${analytics?.last7d?.conversionRate}%` },
    ];

    return (
        <>
            <div>
                <h2 className="text-xl font-semibold tracking-tight">
                    Welcome, {merchant.business_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                    Here&apos;s a quick overview of your real payment activity.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <Card key={s.label}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                {s.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{s.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
