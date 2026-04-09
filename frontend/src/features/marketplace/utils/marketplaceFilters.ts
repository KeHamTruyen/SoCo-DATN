import type { ProductQueryParams } from "../types/marketplace.types";

export function parseSort(raw: string | null): NonNullable<ProductQueryParams["sort"]> {
    if (
        raw === "relevance" ||
        raw === "newest" ||
        raw === "price_asc" ||
        raw === "price_desc" ||
        raw === "popular"
    ) {
        return raw;
    }
    return "relevance";
}

export function parseRatingFilter(
    raw: string | null,
): ProductQueryParams["ratingFilter"] | undefined {
    if (
        raw === "1_plus" ||
        raw === "2_plus" ||
        raw === "3_plus" ||
        raw === "4_plus" ||
        raw === "5_only"
    ) {
        return raw;
    }
    return undefined;
}

