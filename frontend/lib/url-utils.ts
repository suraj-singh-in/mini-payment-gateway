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
    CREATE: "/merchant",
    ME: "/merchant/me",
    UPDATE_ME: "/merchant/me",
}

export function apiUrl(path: string) {
    if (!path.startsWith("/")) path = `/${path}`;
    return `${BACKEND_BASE_URL}${path}`;
}
