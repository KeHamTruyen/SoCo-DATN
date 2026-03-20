export type ProfileRole = "buyer" | "seller";

export interface PublicUserProfile {
    id: string;
    fullName: string;
    username?: string;
    avatarUrl?: string;
    coverUrl?: string;
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
}

export interface SellerStats {
    monthlySales: number;
    monthlySalesGrowth: number;
    newOrders: number;
    pendingOrders: number;
    productViews: number;
    productViewsToday: number;
}
