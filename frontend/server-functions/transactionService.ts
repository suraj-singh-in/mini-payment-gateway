// server-functions/analyticsService.ts  <-- Rename for clarity

"use server";

import axios from "axios";
import { apiUrl, TRANSACTION_API_END_POINTS } from "@/lib/url-utils";
import { FailureResponse, SuccessResponse } from "@/lib/utils";
import { getAuthHeaderFromCookies } from "./utils";
import { MerchantAnalytics } from "@/types";

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
