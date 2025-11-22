import { cookies } from "next/headers";


export async function getAuthHeaderFromCookies() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) return null;

    return {
        Authorization: `Bearer ${accessToken}`,
    };
}
