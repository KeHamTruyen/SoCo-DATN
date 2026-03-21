import type { ShopInformationSnapshot } from "../../seller/types/shopInformation.types";

export type ProfileRole = "buyer" | "seller";

export interface PublicUserProfile {
    id: string;
    fullName: string;
    username?: string;
    avatarUrl?: string;
    coverUrl?: string;
    /** API trả `coverImage` (Prisma); ưu tiên `coverUrl` nếu có */
    coverImage?: string;
    bio?: string;
    role: ProfileRole;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    isFollowing?: boolean;
    isSelf?: boolean;
    createdAt?: string;
    shopName?: string;
    shopRating?: number;
    shopResponseRate?: number;
    isTopSeller?: boolean;
    isVerified?: boolean;
    location?: string;
    shopInformation?: ShopInformationSnapshot | null;
}

export interface SellerStats {
    monthlySales: number;
    monthlySalesGrowth: number;
    newOrders: number;
    pendingOrders: number;
    productViews: number;
    productViewsToday: number;
}
