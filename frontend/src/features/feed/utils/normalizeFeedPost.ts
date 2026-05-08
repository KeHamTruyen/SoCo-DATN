import type { FeedPost, PostMediaType, PostVisibility } from "../types/feed.types";
import type { UserProfile } from "../../auth/types/auth.types";

/** API / DB cũ có thể thiếu visibility — coi như công khai. */
function coerceVisibility(raw: unknown): PostVisibility {
    if (raw === "PUBLIC" || raw === "FOLLOWERS" || raw === "FOLLOWING" || raw === "PRIVATE") {
        return raw;
    }
    return "PUBLIC";
}

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

function coerceTaggedProducts(raw: unknown): FeedPost["taggedProducts"] {
    if (!Array.isArray(raw)) return undefined;
    return raw
        .filter((entry) => entry && typeof entry === "object")
        .map((entry, index) => {
            const p = entry as Record<string, unknown>;
            return {
                id: String(p.id ?? `tag-${index}`),
                productId: String(p.productId ?? ""),
                productName: String(p.productName ?? ""),
                price: Number(p.price ?? 0),
                imageUrl: p.imageUrl != null ? String(p.imageUrl) : undefined,
                positionX: Number(p.positionX ?? 50),
                positionY: Number(p.positionY ?? 50),
                anchorType:
                    p.anchorType === "INLINE_TEXT" || p.anchorType === "CONTENT_BLOCK"
                        ? p.anchorType
                        : "MEDIA_HOTSPOT",
                blockId: p.blockId != null ? String(p.blockId) : undefined,
                startOffset: p.startOffset != null ? Number(p.startOffset) : undefined,
                endOffset: p.endOffset != null ? Number(p.endOffset) : undefined,
                sortOrder: p.sortOrder != null ? Number(p.sortOrder) : undefined,
            };
        });
}

function deriveTaggedProductsFromRelations(raw: unknown): FeedPost["taggedProducts"] {
    if (!Array.isArray(raw)) return undefined;
    return raw
        .filter((entry) => entry && typeof entry === "object")
        .map((entry, index) => {
            const t = entry as Record<string, unknown>;
            const product =
                t.product && typeof t.product === "object"
                    ? (t.product as Record<string, unknown>)
                    : undefined;
            return {
                id: String(t.id ?? `rel-tag-${index}`),
                productId: String(t.productId ?? product?.id ?? ""),
                productName: String(product?.title ?? ""),
                price: Number(product?.price ?? 0),
                imageUrl:
                    Array.isArray(product?.images) && product!.images[0]
                        ? String((product!.images[0] as Record<string, unknown>).imageUrl ?? "")
                        : undefined,
                positionX: Number(t.positionX ?? 50),
                positionY: Number(t.positionY ?? 50),
                anchorType:
                    t.anchorType === "INLINE_TEXT" || t.anchorType === "CONTENT_BLOCK"
                        ? t.anchorType
                        : "MEDIA_HOTSPOT",
                blockId: t.blockId != null ? String(t.blockId) : undefined,
                startOffset: t.startOffset != null ? Number(t.startOffset) : undefined,
                endOffset: t.endOffset != null ? Number(t.endOffset) : undefined,
                sortOrder: t.sortOrder != null ? Number(t.sortOrder) : undefined,
            };
        });
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
        taggedProducts:
            coerceTaggedProducts(raw.taggedProducts) ??
            deriveTaggedProductsFromRelations(raw.productTags),
        taggedUsers: raw.taggedUsers as FeedPost["taggedUsers"],
        scheduledAt:
            raw.scheduledAt != null
                ? String(raw.scheduledAt)
                : raw.scheduledTime != null
                  ? String(raw.scheduledTime)
                  : undefined,
        isScheduled: raw.isScheduled as boolean | undefined,
        scheduledStatus:
            raw.status === "scheduled" || raw.status === "published" || raw.status === "failed"
                ? (raw.status as FeedPost["scheduledStatus"])
                : undefined,
        publishedPostId:
            raw.publishedPostId != null ? String(raw.publishedPostId) : undefined,
        publishedAt:
            raw.publishedAt != null
                ? String(raw.publishedAt)
                : raw.publishedPost &&
                    typeof raw.publishedPost === "object" &&
                    (raw.publishedPost as Record<string, unknown>).publishedAt != null
                  ? String(
                        (raw.publishedPost as Record<string, unknown>).publishedAt,
                    )
                  : undefined,
        location: raw.location != null ? String(raw.location) : undefined,
        feeling: raw.feeling != null ? String(raw.feeling) : undefined,
        groupId: raw.groupId != null ? String(raw.groupId) : undefined,
        group: raw.group as FeedPost["group"],
        visibility: coerceVisibility(raw.visibility),
    };
}
