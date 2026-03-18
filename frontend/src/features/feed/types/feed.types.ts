import type { UserProfile } from "../../auth/types/auth.types";

export interface FeedComment {
    id: string;
    content: string;
    createdAt: string;
    author: UserProfile;
}

export interface ShoppableProduct {
    id: string;
    productId: string;
    productName: string;
    price: number;
    imageUrl?: string;
    positionX: number;
    positionY: number;
}

export interface FeedPost {
    id: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    likedByMe?: boolean;
    likesCount: number;
    commentsCount: number;
    author: UserProfile;
    comments?: FeedComment[];
    taggedProducts?: ShoppableProduct[];
    scheduledAt?: string;
    isScheduled?: boolean;
    location?: string;
}

export interface FeedPageResponse {
    items: FeedPost[];
    nextCursor: string | null;
}

export interface ScheduledPostsResponse {
    items: FeedPost[];
    total: number;
}

