import type { UserProfile } from "../../auth/types/auth.types";

export interface FeedComment {
    id: string;
    content: string;
    createdAt: string;
    user: UserProfile;
}

export interface ShoppableProduct {
    id: string;
    productId: string;
    productName: string;
    price: number;
    imageUrl?: string;
    positionX: number;
    positionY: number;
    anchorType?: "MEDIA_HOTSPOT" | "INLINE_TEXT" | "CONTENT_BLOCK";
    blockId?: string;
    startOffset?: number;
    endOffset?: number;
    sortOrder?: number;
}

export interface ProductTagInput {
    productId: string;
    anchorType?: "MEDIA_HOTSPOT" | "INLINE_TEXT" | "CONTENT_BLOCK";
    positionX?: number;
    positionY?: number;
    blockId?: string;
    startOffset?: number;
    endOffset?: number;
    sortOrder?: number;
}

export type PostMediaType = "IMAGE" | "VIDEO" | "NONE";

/** Ai được xem bài (khớp backend PostVisibility). */
export type PostVisibility = "PUBLIC" | "FOLLOWERS" | "FOLLOWING" | "PRIVATE";

export interface TaggedUserBrief {
    id: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
}

export interface FeedPostGroup {
    id: string;
    name: string;
    avatarUrl?: string | null;
    coverImageUrl?: string | null;
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
    scheduledStatus?: "scheduled" | "published" | "failed";
    publishedPostId?: string;
    publishedAt?: string;
    location?: string;
    feeling?: string;
    groupId?: string;
    group?: FeedPostGroup;
    visibility?: PostVisibility;
}

/** Payload for creating or scheduling a post from the composer modal. */
export interface CreatePostPayload {
    content: string;
    mediaUrls?: string[];
    mediaType?: PostMediaType;
    productTags?: ProductTagInput[];
    location?: string | null;
    feeling?: string | null;
    taggedUserIds?: string[];
    scheduledAt?: string;
    groupId?: string;
    visibility?: PostVisibility;
}

export interface FeedPageResponse {
    items: FeedPost[];
    nextCursor: string | null;
}

export interface ScheduledPostsResponse {
    items: FeedPost[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export type ScheduledAnalyticsRange = "7d" | "30d" | "90d";

export interface ScheduledPostAnalyticsSummary {
    publishedCount: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
    engagementRate: number;
}

export interface ScheduledPostAnalyticsPoint {
    date: string;
    publishedCount: number;
    views: number;
    engagement: number;
}

export interface ScheduledPostAnalyticsItem {
    scheduledPostId: string;
    publishedPostId: string;
    content: string;
    mediaUrls?: string[];
    mediaType?: PostMediaType | null;
    scheduledTime: string;
    publishedAt: string;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    engagement: number;
    engagementRate: number;
}

export interface ScheduledPostsAnalyticsResponse {
    summary: ScheduledPostAnalyticsSummary;
    series: ScheduledPostAnalyticsPoint[];
    topPosts: ScheduledPostAnalyticsItem[];
    range: ScheduledAnalyticsRange;
}

