import { http } from "@/lib/httpClient";

function unwrap<T>(res: { data?: T; success?: boolean } | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as { data: T }).data;
    }
    return res as T;
}

export interface AdminUserRow {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
    lastLogin: string | null;
    _count: { products: number; posts: number; orders: number };
}

export interface AdminUsersResult {
    users: AdminUserRow[];
    total: number;
    page: number;
    limit: number;
}

export interface AdminDashboardStats {
    totalUsers: number;
    totalSellers: number;
    totalBuyers: number;
    totalProducts: number;
    totalPosts: number;
    totalOrders: number;
    newUsersToday: number;
    newOrdersToday: number;
    totalRevenue: number;
}

export interface AdminGrowthResult {
    userGrowth: { date: string; count: number }[];
    orderGrowth: { date: string; count: number }[];
}

export interface AdminPostRow {
    id: string;
    content: string | null;
    mediaUrls: string[];
    status: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
        fullName: string | null;
        avatarUrl: string | null;
    };
}

export interface AdminProductRow {
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: string;
    seller: { id: string; username: string; fullName: string | null };
    images: { imageUrl: string }[];
}

export const adminApi = {
    async getUsers(params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        isActive?: string;
    }) {
        const q = new URLSearchParams();
        if (params.page != null) q.set("page", String(params.page));
        if (params.limit != null) q.set("limit", String(params.limit));
        if (params.search) q.set("search", params.search);
        if (params.role) q.set("role", params.role);
        if (params.isActive != null && params.isActive !== "")
            q.set("isActive", params.isActive);
        const res = await http<{ data: AdminUsersResult }>(
            `/admin/users?${q}`,
        );
        return unwrap<AdminUsersResult>(res);
    },

    async toggleUserActive(userId: string) {
        const res = await http<{ data: { user: AdminUserRow } }>(
            `/admin/users/${userId}/toggle-active`,
            { method: "PATCH", body: {} },
        );
        return unwrap(res);
    },

    async getDashboard() {
        const res = await http<{ data: AdminDashboardStats }>("/admin/dashboard");
        return unwrap<AdminDashboardStats>(res);
    },

    async getGrowth(days: number) {
        const res = await http<{ data: AdminGrowthResult }>(
            `/admin/dashboard/growth?days=${days}`,
        );
        return unwrap<AdminGrowthResult>(res);
    },

    async getPosts(params: { page?: number; limit?: number; status?: string }) {
        const q = new URLSearchParams();
        if (params.page != null) q.set("page", String(params.page));
        if (params.limit != null) q.set("limit", String(params.limit));
        if (params.status) q.set("status", params.status);
        const res = await http<{
            data: {
                posts: AdminPostRow[];
                total: number;
                page: number;
                limit: number;
            };
        }>(`/admin/posts?${q}`);
        return unwrap(res);
    },

    async deletePost(postId: string) {
        await http(`/admin/posts/${postId}`, { method: "DELETE" });
    },

    async getProducts(params: {
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
                products: AdminProductRow[];
                total: number;
                page: number;
                limit: number;
            };
        }>(`/admin/products?${q}`);
        return unwrap(res);
    },

    async deleteProduct(productId: string) {
        await http(`/admin/products/${productId}`, { method: "DELETE" });
    },
};
