import type { FeedPost, ShoppableProduct } from "../types/feed.types";

export function getTaggedProductIds(post: FeedPost): string[] {
    return (
        post.taggedProducts
            ?.map((tag) => tag.productId?.trim())
            .filter((id): id is string => Boolean(id)) ?? []
    );
}

/** One entry per productId (first tag wins), sorted by sortOrder when present. */
export function getUniqueTaggedProducts(post: FeedPost): ShoppableProduct[] {
    const tags = post.taggedProducts ?? [];
    const byProductId = new Map<string, ShoppableProduct>();
    for (const tag of tags) {
        const id = tag.productId?.trim();
        if (!id || byProductId.has(id)) continue;
        byProductId.set(id, tag);
    }
    return [...byProductId.values()].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
}
