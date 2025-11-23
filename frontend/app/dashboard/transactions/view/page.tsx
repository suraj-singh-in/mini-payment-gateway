"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import {
    TransactionFilters,
    TransactionSummary,
    getTransactions,
} from "@/server-functions/transactionService";
import { TransactionFiltersBar } from "@/components/transactions/TransactionFilters";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionDetailsDialog } from "@/components/transactions/TransactionDetailsDialog";
import { Separator } from "@/components/ui/separator";

// utils/date.ts
function getLast24HoursFilter() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
        from: yesterday.toISOString().split("T")[0], // YYYY-MM-DD
        to: now.toISOString().split("T")[0],
    };
}


export default function TransactionsPage() {
    const { user } = useDashboard();
    const [filters, setFilters] = useState<TransactionFilters>({ limit: 50, ...getLast24HoursFilter() });
    const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const fetchTransactions = async (f: TransactionFilters) => {
        setLoading(true);
        setError(null);

        const res = await getTransactions(f);
        if (res.success) {
            setTransactions(res?.data?.transactions || []);
        } else {
            setTransactions([]);
            setError(res.message || "Failed to load transactions");
        }

        setLoading(false);
    };

    useEffect(() => {
        if (!user) return;
        fetchTransactions(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, JSON.stringify(filters)]);

    const handleFilterChange = (newFilters: TransactionFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handleView = (id: string) => {
        setSelectedTxId(id);
        setDetailsOpen(true);
    };

    if (!user) {
        return <p className="text-sm text-muted-foreground">You must be logged in.</p>;
    }

    return (
        <div className="space-y-4 m-5">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">
                    Transactions
                </h1>
                <p className="text-sm text-muted-foreground">
                    View and filter your payment history.
                </p>
            </div>

            <Separator />

            <TransactionFiltersBar initialFilters={filters} onChange={handleFilterChange} />

            {error && (
                <p className="text-sm text-red-500">
                    ⚠ {error}
                </p>
            )}

            <TransactionTable
                transactions={transactions}
                loading={loading}
                onView={handleView}
            />

            <TransactionDetailsDialog
                open={detailsOpen}
                onOpenChange={(open) => {
                    setDetailsOpen(open);
                    if (!open) setSelectedTxId(null);
                }}
                transactionId={selectedTxId}
            />
        </div>
    );
}
