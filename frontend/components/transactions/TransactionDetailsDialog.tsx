"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TransactionDetails, getTransactionDetails } from "@/server-functions/transactionService";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionId: string | null;
};

export function TransactionDetailsDialog({
    open,
    onOpenChange,
    transactionId,
}: Props) {
    const [details, setDetails] = useState<TransactionDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !transactionId) return;

        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            const res = await getTransactionDetails(transactionId);
            if (res.success) {
                setDetails(res.data);
            } else {
                setDetails(null);
                setError(res.message || "Failed to load transaction details");
            }
            setLoading(false);
        };

        fetchDetails();
    }, [open, transactionId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Transaction details</DialogTitle>
                    <DialogDescription>
                        ID: {transactionId || "—"}
                    </DialogDescription>
                </DialogHeader>

                {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
                {error && <p className="text-sm text-red-500">⚠ {error}</p>}

                {details && !loading && !error && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge className="capitalize">{details.status}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="font-medium">
                                {details.amount / 100} {details.currency}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Customer</span>
                            <span>{details.customer_email || "—"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Payment method</span>
                            <span>{details.payment_method || "—"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Created at</span>
                            <span>{new Date(details.created_at).toLocaleString()}</span>
                        </div>

                        {details.metadata && (
                            <div className="mt-2">
                                <p className="text-sm text-muted-foreground mb-1">Metadata</p>
                                <pre className="rounded bg-muted p-2 text-xs overflow-auto">
                                    {JSON.stringify(details.metadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
