import { http } from "@/lib/httpClient";

export interface AdminUser {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
    role: string;
    avatarUrl: string | null;
}

export async function adminLogin(email: string, password: string) {
    const res = await http<{
        success: boolean;
        data: { user: AdminUser; accessToken: string };
    }>("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
    });
    return res.data;
}
