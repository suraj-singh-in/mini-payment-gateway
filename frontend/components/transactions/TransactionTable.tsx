"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransactionSummary } from "@/server-functions/transactionService";

type Props = {
    transactions: TransactionSummary[];
    loading: boolean;
    onView: (id: string) => void;
};

function formatAmount(amount: number, currency: string) {
    // Basic formatter; tweak if you want INR-specific style
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount / 100); // assuming amount is in minor units
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "succeeded":
            return "default";
        case "pending":
            return "secondary";
        case "failed":
            return "destructive";
        default:
            return "outline";
    }
}

export function TransactionTable({ transactions, loading, onView }: Props) {
    if (loading) {
        return <p className="text-sm text-muted-foreground">Loading transactions…</p>;
    }

    if (!transactions.length) {
        return <p className="text-sm text-muted-foreground">No transactions found.</p>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Created</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Customer Email</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                            <TableCell>{formatDate(tx.created_at)}</TableCell>
                            <TableCell>{formatAmount(tx.amount, tx.currency)}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant(tx.status)} className="capitalize">
                                    {tx.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{tx.customer_email || "—"}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onView(tx.id)}
                                >
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
