"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
    refreshTokenServerFunction,
    logoutServerFunction,
} from "@/server-functions/authService";

import { getMyMerchant } from "@/server-functions/merchantService";
import { Merchant } from "@/types";

export type DashboardUser = {
    id: string;
    email: string;
    role: string;
};

type DashboardContextValue = {
    user: DashboardUser | null;
    merchant: Merchant | null;
    loadingUser: boolean;
    loadingMerchant: boolean;
    userError: string | null;
    merchantError: string | null;
    refreshUser: () => Promise<void>;
    refreshMerchant: () => Promise<void>;
    setMerchant: (merchant: Merchant | null) => void;
    logout: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | undefined>(
    undefined
);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<DashboardUser | null>(null);
    const [merchant, setMerchant] = useState<Merchant | null>(null);

    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingMerchant, setLoadingMerchant] = useState(true);

    const [userError, setUserError] = useState<string | null>(null);
    const [merchantError, setMerchantError] = useState<string | null>(null);

    const router = useRouter();

    const refreshUser = async () => {
        setLoadingUser(true);
        setUserError(null);
        try {
            const res = await refreshTokenServerFunction();
            console.log("refreshUser res", res)
            if (res?.success && res.data?.user) {
                setUser(res.data.user);
            } else {
                setUser(null);
                setUserError(res?.message || "Not authenticated");
                router.push("/auth?type=login");

            }
        } catch (err) {
            console.error("Failed to load current user:", err);
            setUser(null);
            setUserError("Failed to load user");
            router.push("/auth?type=login");
        } finally {
            setLoadingUser(false);
        }
    };

    const refreshMerchant = async () => {
        setLoadingMerchant(true);
        setMerchantError(null);
        try {
            const res = await getMyMerchant();
            console.log("res", res)
            if (res.success) {
                setMerchant(res.data);
            } else {
                // If backend sends 404 "Merchant not found", your server function
                // should still return success=false; we treat this as "no merchant yet".
                console.warn("getMyMerchant failed:", res.message);
                setMerchant(null);
                setMerchantError(res.message || null);
            }
        } catch (err) {
            console.error("Failed to load merchant:", err);
            setMerchant(null);
            setMerchantError("Failed to load merchant");
        } finally {
            setLoadingMerchant(false);
        }
    };

    const logout = async () => {
        try {
            await logoutServerFunction();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setUser(null);
            setMerchant(null);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    useEffect(() => {
        console.log("user", user)
        // Once we know user, try loading merchant
        if (user) {
            refreshMerchant();
        } else {
            setMerchant(null);
            setLoadingMerchant(false);
        }
    }, [user]);

    return (
        <DashboardContext.Provider
            value={{
                user,
                merchant,
                loadingUser,
                loadingMerchant,
                userError,
                merchantError,
                refreshUser,
                refreshMerchant,
                setMerchant,
                logout,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const ctx = useContext(DashboardContext);
    if (!ctx) {
        throw new Error("useDashboard must be used within DashboardProvider");
    }
    return ctx;
}
