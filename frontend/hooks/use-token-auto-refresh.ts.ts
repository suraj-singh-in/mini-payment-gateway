"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    refreshTokenServerFunction,
    logoutServerFunction,
} from "@/server-functions/authService";

const REFRESH_INTERVAL_MINUTES = Number(
    process.env.NEXT_PUBLIC_AUTH_REFRESH_INTERVAL_MINUTES ?? "0"
);

export function useTokenAutoRefresh() {
    const router = useRouter();

    useEffect(() => {
        if (!REFRESH_INTERVAL_MINUTES || REFRESH_INTERVAL_MINUTES <= 0) return;

        const intervalMs = REFRESH_INTERVAL_MINUTES * 60_000;

        async function handleRefresh() {
            try {
                const res = await refreshTokenServerFunction();

                if (!res?.success) {
                    console.warn("Token refresh failed:", res?.data?.message);
                    await logoutServerFunction();
                    router.push("/auth?type=login");
                }
            } catch (err) {
                console.error("Token refresh error:", err);
                await logoutServerFunction();
                router.push("/auth?type=login");
            }
        }

        // Optional: run once on mount
        // handleRefresh();

        const id = setInterval(handleRefresh, intervalMs);

        return () => clearInterval(id);
    }, [router]);
}
