import { httpClient } from "../../../shared/api/httpClient";
import type { UserProfile } from "../../auth/types/auth.types";
import type { ShopInformationSnapshot } from "../../seller/types/shopInformation.types";
import type { PublicUserProfile, SellerStats } from "../types/profile.types";

interface ApiListResponse<T> {
    data?: T[] | { items: T[] };
}

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

export const profileApi = {
    async getMyProfile() {
        const res = await httpClient.get<ApiResponse<UserProfile> | UserProfile>(
            "/users/me",
            { requiresAuth: true },
        );
        return unwrap<UserProfile>(res);
    },
    async getProfile(userId: string) {
        const res = await httpClient.get<ApiResponse<PublicUserProfile> | PublicUserProfile>(
            `/users/${userId}`,
            { requiresAuth: true },
        );
        return unwrap<PublicUserProfile>(res);
    },
    async followUser(userId: string) {
        const res = await httpClient.post<ApiResponse<{ following: boolean }> | { following: boolean }>(
            `/users/${userId}/follow`,
            {},
            { requiresAuth: true },
        );
        return unwrap<{ following: boolean }>(res);
    },
    async unfollowUser(userId: string) {
        const res = await httpClient.delete<ApiResponse<{ following: boolean }> | { following: boolean }>(
            `/users/${userId}/follow`,
            { requiresAuth: true },
        );
        return unwrap<{ following: boolean }>(res);
    },
    async getSellerStats() {
        const res = await httpClient.get<ApiResponse<SellerStats> | SellerStats>(
            "/seller/stats",
            { requiresAuth: true },
        );
        return unwrap<SellerStats>(res);
    },
    async updateProfile(payload: {
        fullName?: string;
        username?: string;
        phone?: string;
        bio?: string;
        avatarUrl?: string | null;
        coverImage?: string | null;
        address?: string | null;
        shopInformation?: ShopInformationSnapshot | null;
    }) {
        const res = await httpClient.put<ApiResponse<UserProfile> | UserProfile>(
            "/users/me",
            payload,
            { requiresAuth: true },
        );
        return unwrap<UserProfile>(res);
    },
    async listSuggestedUsers(): Promise<PublicUserProfile[]> {
        try {
            const res = await httpClient.get<
                ApiListResponse<PublicUserProfile> | PublicUserProfile[]
            >("/users/suggested", { requiresAuth: true });
            if (Array.isArray(res)) return res;
            if (res && typeof res === "object" && "data" in res) {
                const d = (res as ApiListResponse<PublicUserProfile>).data;
                if (Array.isArray(d)) return d;
                if (d && "items" in d) return d.items;
            }
            return [];
        } catch {
            return [];
        }
    },
};

