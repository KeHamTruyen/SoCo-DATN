import { httpClient } from "../../../shared/api/httpClient";
import type { UserProfile } from "../../auth/types/auth.types";
import type { ShopInformationSnapshot } from "../../seller/types/shopInformation.types";
import type { ProfileRole, PublicUserProfile, SellerStats } from "../types/profile.types";

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

type ApiUserCount = {
    followers?: number;
    following?: number;
    posts?: number;
    reviews?: number;
};

/** Backend returns Prisma `_count`; UI expects `followersCount` / `followingCount`. */
function normalizePublicUserProfile(raw: Record<string, unknown>): PublicUserProfile {
    const counts = raw._count as ApiUserCount | undefined;
    const roleRaw = raw.role as string | undefined;
    const role: ProfileRole =
        roleRaw === "seller" || roleRaw === "SELLER" ? "seller" : "buyer";
    const { _count: _omitCount, ...rest } = raw as Record<string, unknown> & {
        _count?: unknown;
    };
    const base = rest as unknown as PublicUserProfile;
    return {
        ...base,
        role,
        followersCount: counts?.followers ?? base.followersCount,
        followingCount: counts?.following ?? base.followingCount,
        postsCount: counts?.posts ?? base.postsCount,
        reviewsCount: counts?.reviews ?? base.reviewsCount,
    };
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
        const res = await httpClient.get<ApiResponse<Record<string, unknown>> | Record<string, unknown>>(
            `/users/${userId}`,
            { requiresAuth: false },
        );
        return normalizePublicUserProfile(unwrap(res));
    },
    async followUser(userId: string) {
        const res = await httpClient.post<ApiResponse<{ followed: boolean }> | { followed: boolean }>(
            `/users/${userId}/follow`,
            {},
            { requiresAuth: true },
        );
        return unwrap<{ followed: boolean }>(res);
    },
    async unfollowUser(userId: string) {
        const res = await httpClient.delete<ApiResponse<{ followed: boolean }> | { followed: boolean }>(
            `/users/${userId}/follow`,
            { requiresAuth: true },
        );
        return unwrap<{ followed: boolean }>(res);
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
            if (Array.isArray(res)) {
                return res.map((u) =>
                    normalizePublicUserProfile(u as unknown as Record<string, unknown>),
                );
            }
            if (res && typeof res === "object" && "data" in res) {
                const d = (res as ApiListResponse<PublicUserProfile>).data;
                if (Array.isArray(d)) {
                    return d.map((u) =>
                        normalizePublicUserProfile(u as unknown as Record<string, unknown>),
                    );
                }
                if (d && "items" in d) {
                    return d.items.map((u) =>
                        normalizePublicUserProfile(u as unknown as Record<string, unknown>),
                    );
                }
            }
            return [];
        } catch {
            return [];
        }
    },
};

