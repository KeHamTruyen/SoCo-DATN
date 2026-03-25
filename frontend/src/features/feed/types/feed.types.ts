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

export type PostMediaType = "IMAGE" | "VIDEO" | "NONE";

export interface TaggedUserBrief {
    id: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
}

export interface FeedPost {
    id: string;
    content: string;
    imageUrl?: string;
    mediaUrls?: string[];
    mediaType?: PostMediaType | null;
    linkUrl?: string;
    createdAt: string;
    likedByMe?: boolean;
    likesCount: number;
    commentsCount: number;
    sharesCount?: number;
    author: UserProfile;
    comments?: FeedComment[];
    taggedProducts?: ShoppableProduct[];
    taggedUsers?: TaggedUserBrief[];
    scheduledAt?: string;
    isScheduled?: boolean;
    location?: string;
    feeling?: string;
}

/** Payload for creating or scheduling a post from the composer modal. */
export interface CreatePostPayload {
    content: string;
    mediaUrls?: string[];
    mediaType?: PostMediaType;
    productId?: string | null;
    location?: string | null;
    feeling?: string | null;
    taggedUserIds?: string[];
    scheduledAt?: string;
}

export interface FeedPageResponse {
    items: FeedPost[];
    nextCursor: string | null;
}

export interface ScheduledPostsResponse {
    items: FeedPost[];
    total: number;
}

