import type { FeedPost } from "../types/feed.types";

/** Stable media list: prefer `mediaUrls`, always include `imageUrl` when present. */
export function resolvePostMediaUrls(post: Pick<FeedPost, "mediaUrls" | "imageUrl">): string[] {
    const fromArray = post.mediaUrls ?? [];
    const primary = post.imageUrl?.trim();
    const merged = primary ? [...fromArray, primary] : fromArray;
    return [...new Set(merged.filter((url) => typeof url === "string" && url.trim().length > 0))];
}
