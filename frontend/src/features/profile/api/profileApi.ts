import { httpClient } from "../../../shared/api/httpClient";
import type { UserProfile } from "../../auth/types/auth.types";
import type { PublicUserProfile, SellerStats } from "../types/profile.types";

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
};

