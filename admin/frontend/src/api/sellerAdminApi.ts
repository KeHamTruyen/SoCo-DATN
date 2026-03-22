import { http } from "@/lib/httpClient";

function unwrap<T>(res: { data?: T } | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as { data: T }).data;
    }
    return res as T;
}

export interface SellerApplicationAdmin {
    id: string;
    userId: string;
    status: string;
    businessName?: string | null;
    createdAt: string;
    user?: {
        id: string;
        email: string;
        username: string;
        fullName: string | null;
        avatarUrl: string | null;
    };
    [key: string]: unknown;
}

export const sellerAdminApi = {
    async listApplications(params: {
        page?: number;
        limit?: number;
        status?: string;
    }) {
        const q = new URLSearchParams();
        if (params.page != null) q.set("page", String(params.page));
        if (params.limit != null) q.set("limit", String(params.limit));
        if (params.status) q.set("status", params.status);
        const res = await http<{
            data: {
                applications: SellerApplicationAdmin[];
                total: number;
                page: number;
                limit: number;
            };
        }>(`/seller/applications?${q}`);
        return unwrap(res);
    },

    async approve(id: string) {
        await http(`/seller/applications/${id}/approve`, {
            method: "POST",
            body: {},
        });
    },

    async reject(id: string, reason: string) {
        await http(`/seller/applications/${id}/reject`, {
            method: "POST",
            body: { reason },
        });
    },
};
