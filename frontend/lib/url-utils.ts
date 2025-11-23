// src/lib/api-url.ts

const BACKEND_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export const AUTH_API_END_POINTS = {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
    GET_USER: "/api/auth/me"
}

export const MERCHANT_API_END_POINTS = {
    CREATE: "/api/merchant",
    ME: "/api/merchant/me",
    UPDATE_ME: "/api/merchant/me",
    CREDENTIALS: "/api/merchant/me/credentials"
}

export const TRANSACTION_API_END_POINTS = {
    ANALYTICS: "/api/transactions/analytics",
}

export function apiUrl(path: string) {
    if (!path.startsWith("/")) path = `/${path}`;
    return `${BACKEND_BASE_URL}${path}`;
}
