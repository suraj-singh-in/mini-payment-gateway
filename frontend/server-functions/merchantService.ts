"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { apiUrl, MERCHANT_API_END_POINTS } from "@/lib/url-utils";
import { FailureResponse, SuccessResponse } from "@/lib/utils";
import { Merchant, MerchantCredentials } from "@/types";



async function getAuthHeaderFromCookies() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) return null;

    return {
        Authorization: `Bearer ${accessToken}`,
    };
}


async function createMerchant(businessName: string) {
    try {
        const headers = await getAuthHeaderFromCookies();
        if (!headers) {
            return FailureResponse(null, "Not authenticated");
        }

        const res = await axios.post<{
            merchant: Merchant;
            credentials: MerchantCredentials;
        }>(
            apiUrl(MERCHANT_API_END_POINTS.CREATE),
            { businessName }, // backend expects businessName
            { headers }
        );

        return SuccessResponse(res.data);
    } catch (error: any) {
        console.error("createMerchant error:", error?.response?.data || error);
        const message =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to create merchant";
        return FailureResponse(error, message);
    }
}

async function getMyMerchant() {
    try {
        const headers = await getAuthHeaderFromCookies();
        if (!headers) {
            return FailureResponse(null, "Not authenticated");
        }

        const res = await axios.get<Merchant>(
            apiUrl(MERCHANT_API_END_POINTS.ME),
            { headers }
        );

        console.log("getMyMerchant res, ", res)

        return SuccessResponse(res.data);
    } catch (error: any) {
        console.error("getMyMerchant error:", error?.response?.data || error);
        const message =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch merchant";
        return FailureResponse(error, message);
    }
}

type UpdateMerchantPayload = {
    business_name?: string;
    webhook_url?: string | null;
};

async function updateMyMerchant(payload: UpdateMerchantPayload) {
    try {
        const headers = await getAuthHeaderFromCookies();
        if (!headers) {
            return FailureResponse(null, "Not authenticated");
        }

        const res = await axios.patch<Merchant>(
            apiUrl(MERCHANT_API_END_POINTS.UPDATE_ME),
            payload,
            { headers }
        );

        return SuccessResponse(res.data);
    } catch (error: any) {
        console.error("updateMyMerchant error:", error?.response?.data || error);
        const message =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to update merchant";
        return FailureResponse(error, message);
    }
}


export { createMerchant, getMyMerchant, updateMyMerchant };
