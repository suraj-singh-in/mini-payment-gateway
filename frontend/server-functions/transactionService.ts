// server-functions/analyticsService.ts  <-- Rename for clarity

"use server";

import axios from "axios";
import { apiUrl, TRANSACTION_API_END_POINTS } from "@/lib/url-utils";
import { FailureResponse, SuccessResponse } from "@/lib/utils";
import { getAuthHeaderFromCookies } from "./utils";
import { MerchantAnalytics } from "@/types";

export type TransactionSummary = {
    id: string;
    amount: number;
    currency: string;
    status: string;
    customer_email: string | null;
    created_at: string;
};

export type TransactionListResponse = {
    count: number;
    transactions: TransactionSummary[];
};

export type TransactionDetails = TransactionSummary & {
    metadata: Record<string, any> | null;
    payment_method: string | null;
};

export type TransactionFilters = {
    status?: string;
    from?: string; // ISO date string
    to?: string;   // ISO date string
    limit?: number;
};

export async function getAnalytics() {
    try {
        const headers = await getAuthHeaderFromCookies();

        if (!headers) {
            return FailureResponse(null, "Not authenticated");
        }

        const res = await axios.get<MerchantAnalytics>(
            apiUrl(TRANSACTION_API_END_POINTS.ANALYTICS),
            { headers }
        );

        return SuccessResponse(res.data);
    } catch (error: any) {
        console.error("getAnalytics error:", error?.response?.data || error);

        const message =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to getAnalytics";

        return FailureResponse(null, message);
    }
}

export async function getTransactions(filters: TransactionFilters) {
    try {
        const headers = await getAuthHeaderFromCookies();
        if (!headers) {
            return FailureResponse(null, "Not authenticated");
        }

        const res = await axios.get<TransactionListResponse>(
            apiUrl(TRANSACTION_API_END_POINTS.LIST),
            {
                headers,
                params: {
                    status: filters.status || undefined,
                    from: filters.from || undefined,
                    to: filters.to || undefined,
                    limit: filters.limit || undefined,
                },
            }
        );

        return SuccessResponse(res.data);
    } catch (error: any) {
        console.error("getTransactions error:", error?.response?.data || error);
        const message =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch transactions";
        return FailureResponse(null, message);
    }
}

export async function getTransactionDetails(id: string) {
    try {
        const headers = await getAuthHeaderFromCookies();
        if (!headers) {
            return FailureResponse(null, "Not authenticated");
        }

        const res = await axios.get<TransactionDetails>(
            apiUrl(TRANSACTION_API_END_POINTS.DETAILS(id)),
            { headers }
        );

        return SuccessResponse(res.data);
    } catch (error: any) {
        console.error("getTransactionDetails error:", error?.response?.data || error);
        const message =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch transaction details";
        return FailureResponse(null, message);
    }
}
