import type { FeedPost, PostMediaType } from "../types/feed.types";
import type { UserProfile } from "../../auth/types/auth.types";

function coerceAuthor(raw: unknown): UserProfile {
    if (!raw || typeof raw !== "object") {
        return { id: "", email: "" };
    }
    const a = raw as Record<string, unknown>;
    return {
        id: String(a.id ?? ""),
        email: String(a.email ?? ""),
        username: a.username != null ? String(a.username) : undefined,
        fullName: a.fullName != null ? String(a.fullName) : undefined,
        avatarUrl: a.avatarUrl != null ? String(a.avatarUrl) : undefined,
        role: a.role as UserProfile["role"],
        shopInformation: a.shopInformation as UserProfile["shopInformation"],
    };
}

/**
 * Map a raw post object from the API (Prisma-shaped or serialized) into `FeedPost`.
 */
export function normalizeFeedPost(raw: Record<string, unknown> | null | undefined): FeedPost {
    if (!raw || typeof raw !== "object") {
        return {
            id: "",
            content: "",
            createdAt: new Date().toISOString(),
            likesCount: 0,
            commentsCount: 0,
            author: { id: "", email: "" },
        };
    }

    const mediaUrls = (raw.mediaUrls as string[] | undefined) ?? [];
    const firstMedia = raw.imageUrl != null ? String(raw.imageUrl) : mediaUrls[0];

    return {
        id: String(raw.id ?? ""),
        content: raw.content != null ? String(raw.content) : "",
        imageUrl: firstMedia,
        mediaUrls: mediaUrls.length ? mediaUrls : undefined,
        mediaType: (raw.mediaType as PostMediaType | null | undefined) ?? undefined,
        linkUrl: raw.linkUrl != null ? String(raw.linkUrl) : undefined,
        createdAt: String(
            raw.createdAt ?? raw.scheduledTime ?? new Date().toISOString(),
        ),
        likedByMe: Boolean(raw.likedByMe ?? raw.isLiked),
        likesCount: Number(raw.likesCount ?? 0),
        commentsCount: Number(raw.commentsCount ?? 0),
        sharesCount: raw.sharesCount != null ? Number(raw.sharesCount) : undefined,
        author: raw.author ? coerceAuthor(raw.author) : { id: "", email: "" },
        comments: raw.comments as FeedPost["comments"],
        taggedProducts: raw.taggedProducts as FeedPost["taggedProducts"],
        taggedUsers: raw.taggedUsers as FeedPost["taggedUsers"],
        scheduledAt:
            raw.scheduledAt != null
                ? String(raw.scheduledAt)
                : raw.scheduledTime != null
                  ? String(raw.scheduledTime)
                  : undefined,
        isScheduled: raw.isScheduled as boolean | undefined,
        location: raw.location != null ? String(raw.location) : undefined,
        feeling: raw.feeling != null ? String(raw.feeling) : undefined,
        groupId: raw.groupId != null ? String(raw.groupId) : undefined,
        group: raw.group as FeedPost["group"],
    };
}
