"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { apiUrl, AUTH_API_END_POINTS } from "@/lib/url-utils";
import { FailureResponse, SuccessResponse } from "@/lib/utils";

type BackendAuthResponse = {
    user: { id: string; email: string; role: string };
    accessToken: string;
    refreshToken: string;
};

async function setAuthCookies(accessToken: string, refreshToken: string) {
    const cookieStore = await cookies();

    cookieStore.set({
        name: "accessToken",
        value: accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
    });

    cookieStore.set({
        name: "refreshToken",
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
}

export async function loginServerFunction(email: string, password: string) {
    try {
        const response = await axios.post<BackendAuthResponse>(
            apiUrl(AUTH_API_END_POINTS.LOGIN),
            { email, password }
        );

        const { user, accessToken, refreshToken } = response.data;

        await setAuthCookies(accessToken, refreshToken);

        return SuccessResponse({ user });
    } catch (error: any) {
        console.log("login error", error?.response?.data || error);
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong";
        return FailureResponse(error, message);
    }
}

export async function registerServerFunction(email: string, password: string) {
    try {
        const response = await axios.post<BackendAuthResponse>(
            apiUrl(AUTH_API_END_POINTS.REGISTER),
            { email, password }
        );

        const { user, accessToken, refreshToken } = response.data;

        await setAuthCookies(accessToken, refreshToken);

        return SuccessResponse({ user });
    } catch (error: any) {
        console.log("register error", error?.response?.data || error);
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong";
        return FailureResponse(error, message);
    }
}

export async function refreshTokenServerFunction() {
    try {
        const cookieStore = await cookies();
        const currentRefreshToken = cookieStore.get("refreshToken")?.value;
        console.log("currentRefreshToken", currentRefreshToken);
        if (!currentRefreshToken) {
            return FailureResponse(null, "No refresh token");
        }

        const response = await axios.post<BackendAuthResponse>(
            apiUrl(AUTH_API_END_POINTS.REFRESH),
            { refreshToken: currentRefreshToken }
        );

        const { user, accessToken, refreshToken: newRefreshToken } = response.data;

        await setAuthCookies(accessToken, newRefreshToken);

        return SuccessResponse({ user });
    } catch (error: any) {
        console.log("refresh error", error?.response?.data || error);

        const cookieStore = await cookies();
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");

        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Unable to refresh session";

        return FailureResponse(error, message);
    }
}

export async function logoutServerFunction() {
    try {
        const cookieStore = await cookies();
        const currentRefreshToken = cookieStore.get("refreshToken")?.value;

        if (currentRefreshToken) {
            await axios.post(apiUrl(AUTH_API_END_POINTS.LOGOUT), {
                refreshToken: currentRefreshToken,
            });
        }

        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");

        return SuccessResponse({ message: "Logged out" });
    } catch (error: any) {
        console.log("logout error", error?.response?.data || error);

        const cookieStore = await cookies();
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");

        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Logout failed (local session cleared)";

        return FailureResponse(error, message);
    }
}
