"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TransactionFilters } from "@/server-functions/transactionService";

type Props = {
    initialFilters?: TransactionFilters;
    onChange: (filters: TransactionFilters) => void;
};

export function TransactionFiltersBar({ initialFilters, onChange }: Props) {
    const [status, setStatus] = useState(initialFilters?.status || "all");
    const [from, setFrom] = useState(initialFilters?.from || "");
    const [to, setTo] = useState(initialFilters?.to || "");
    const [limit, setLimit] = useState(
        initialFilters?.limit?.toString() || "50"
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onChange({
            status: status === "all" ? undefined : status,
            from: from || undefined,
            to: to || undefined,
            limit: limit ? Number(limit) : undefined,
        });
    };

    const handleReset = () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);


        setStatus("all");
        setFrom(yesterday.toISOString().split("T")[0]);
        setTo(now.toISOString().split("T")[0]);
        setLimit("50");
        onChange({ limit: 50 });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4"
        >
            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                    Status
                </span>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="succeeded">Succeeded</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                    From date
                </span>
                <Input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-[180px]"
                />
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                    To date
                </span>
                <Input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-[180px]"
                />
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                    Limit
                </span>
                <Input
                    type="number"
                    min={1}
                    max={500}
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-[100px]"
                />
            </div>

            <div className="flex gap-2">
                <Button type="submit">Apply</Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                </Button>
            </div>
        </form>
    );
}
