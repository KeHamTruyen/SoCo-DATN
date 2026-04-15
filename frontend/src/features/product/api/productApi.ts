import { httpClient } from "../../../shared/api/httpClient";
import type {
    ProductDetail,
    ProductReviewFilters,
    ProductReviewItem,
    ProductReviewsResponse,
    ProductVariantRow,
} from "../types/product.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

function num(v: unknown, fallback = 0): number {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isNaN(n) ? fallback : n;
    }
    return fallback;
}

function mapOptionsLabel(options: unknown, variantName: string): string {
    if (options && typeof options === "object" && !Array.isArray(options)) {
        const o = options as Record<string, unknown>;
        const parts = Object.entries(o)
            .map(([k, val]) => `${k}: ${String(val)}`)
            .filter(Boolean);
        if (parts.length > 0) return parts.join(", ");
    }
    return variantName;
}

function mapVariantRow(v: Record<string, unknown>): ProductVariantRow {
    const variantName = String(v.variantName ?? "");
    const options = v.options;
    const value = mapOptionsLabel(options, variantName);
    return {
        id: String(v.id),
        name: variantName,
        value,
        price: v.price === null || v.price === undefined ? null : num(v.price),
        stockQuantity: num(v.stockQuantity, 0),
        isActive: v.isActive !== false,
    };
}

function mapReviewPhoto(raw: unknown, idx: number) {
    const imageUrl =
        typeof raw === "string"
            ? raw.trim()
            : String(
                  (raw as Record<string, unknown> | undefined)?.imageUrl ??
                      (raw as Record<string, unknown> | undefined)?.url ??
                      (raw as Record<string, unknown> | undefined)?.path ??
                      "",
              ).trim();
    return {
        id:
            typeof raw === "string"
                ? `photo-${idx}`
                : String((raw as Record<string, unknown> | undefined)?.id ?? `photo-${idx}`),
        imageUrl,
    };
}

function mapReviewItem(raw: Record<string, unknown>, idx: number): ProductReviewItem {
    const photosRaw =
        (raw.images as unknown[] | undefined) ??
        (raw.photos as unknown[] | undefined) ??
        [];
    const photos = photosRaw
        .map((photo, photoIdx) => mapReviewPhoto(photo, photoIdx))
        .filter((photo) => photo.imageUrl.length > 0);

    const authorRaw =
        (raw.user as Record<string, unknown> | undefined) ??
        (raw.author as Record<string, unknown> | undefined) ??
        {};

    return {
        id: String(raw.id ?? `review-${idx}`),
        rating: Math.max(0, Math.min(5, num(raw.rating, 0))),
        title:
            typeof raw.title === "string" && raw.title.trim() !== ""
                ? raw.title.trim()
                : undefined,
        content: String(raw.content ?? raw.comment ?? ""),
        createdAt: String(raw.createdAt ?? raw.created_at ?? new Date(0).toISOString()),
        helpfulCount: num(raw.helpfulCount ?? raw.likesCount ?? raw.upvotes ?? 0, 0),
        author: {
            id: String(authorRaw.id ?? ""),
            name: String(authorRaw.fullName ?? authorRaw.username ?? authorRaw.name ?? "Anonymous"),
            avatarUrl:
                typeof authorRaw.avatarUrl === "string" && authorRaw.avatarUrl.trim() !== ""
                    ? authorRaw.avatarUrl
                    : undefined,
        },
        isVerifiedBuyer: Boolean(raw.isVerifiedBuyer ?? raw.isVerifiedPurchase),
        photos,
        sellerResponse:
            typeof raw.sellerResponse === "string" && raw.sellerResponse.trim() !== ""
                ? raw.sellerResponse.trim()
                : undefined,
        sellerResponseAt:
            typeof raw.sellerResponseAt === "string" && raw.sellerResponseAt.trim() !== ""
                ? raw.sellerResponseAt
                : undefined,
    };
}

export function mapApiProductToDetail(raw: Record<string, unknown>): ProductDetail {
    const imgs = (raw.images as { imageUrl?: string }[] | undefined) ?? [];
    const variantsRaw = (raw.variants as Record<string, unknown>[] | undefined) ?? [];
    const variants = variantsRaw
        .filter((x) => x.isActive !== false)
        .map(mapVariantRow);

    const basePrice = num(raw.price);
    const compare = raw.compareAtPrice;
    const oldPrice =
        compare === null || compare === undefined ? undefined : num(compare);

    return {
        id: String(raw.id ?? ""),
        name: String(raw.title ?? ""),
        description: String(raw.description ?? ""),
        price: basePrice,
        oldPrice: oldPrice && oldPrice > basePrice ? oldPrice : undefined,
        images: imgs.map((i) => i.imageUrl).filter(Boolean) as string[],
        salesCount: num(raw.salesCount, 0),
        viewsCount: num(raw.viewsCount, 0),
        sku: typeof raw.sku === "string" && raw.sku.trim() !== "" ? raw.sku : undefined,
        stockQuantity:
            raw.stockQuantity === null || raw.stockQuantity === undefined
                ? undefined
                : num(raw.stockQuantity, 0),
        categoryName: raw.category && typeof raw.category === "object"
            ? String((raw.category as { name?: unknown }).name ?? "")
            : undefined,
        rating: undefined,
        seller: raw.seller
            ? {
                  id: String((raw.seller as { id?: string }).id ?? ""),
                  name: String(
                      (raw.seller as { fullName?: string; username?: string })
                          .fullName ||
                          (raw.seller as { username?: string }).username ||
                          "",
                  ),
                  avatarUrl: (raw.seller as { avatarUrl?: string }).avatarUrl,
                  followersCount: num((raw.seller as { followersCount?: unknown }).followersCount, 0),
                  shopRating: num((raw.seller as { shopRating?: unknown }).shopRating, 0),
              }
            : undefined,
        variants: variants.length > 0 ? variants : undefined,
    };
}

export const productApi = {
    async getProductDetail(productId: string) {
        const res = await httpClient.get<ApiResponse<Record<string, unknown>> | Record<string, unknown>>(
            `/products/${productId}`,
            { requiresAuth: false },
        );
        const data = unwrap(res);
        return mapApiProductToDetail(data as Record<string, unknown>);
    },

    async getProductReviews(
        productId: string,
        params: { page: number; limit: number } & ProductReviewFilters,
    ): Promise<ProductReviewsResponse> {
        const searchParams = new URLSearchParams();
        searchParams.set("page", String(params.page));
        searchParams.set("limit", String(params.limit));
        if (params.rating) searchParams.set("rating", String(params.rating));
        if (typeof params.hasMedia === "boolean")
            searchParams.set("hasMedia", String(params.hasMedia));
        if (typeof params.hasSellerReply === "boolean")
            searchParams.set("hasSellerReply", String(params.hasSellerReply));
        if (params.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

        const res = await httpClient.get<ApiResponse<Record<string, unknown>> | Record<string, unknown>>(
            `/reviews/product/${productId}?${searchParams.toString()}`,
            { requiresAuth: false },
        );
        const data = unwrap(res) as Record<string, unknown>;

        const rawItems =
            (Array.isArray(data.items) ? data.items : undefined) ??
            (Array.isArray(data.reviews) ? data.reviews : undefined) ??
            (Array.isArray(data.data) ? data.data : undefined) ??
            [];

        const pagination = (data.pagination as Record<string, unknown> | undefined) ?? {};
        const total = num(pagination.total ?? data.total ?? rawItems.length, rawItems.length);
        const page = num(pagination.page ?? data.page ?? params.page, params.page);
        const limit = num(pagination.limit ?? data.limit ?? params.limit, params.limit);
        const rawDistribution = (data.ratingDistribution as Record<string, unknown> | undefined) ?? {};
        const ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
            1: num(rawDistribution["1"], 0),
            2: num(rawDistribution["2"], 0),
            3: num(rawDistribution["3"], 0),
            4: num(rawDistribution["4"], 0),
            5: num(rawDistribution["5"], 0),
        };

        return {
            items: rawItems
                .map((item, idx) => mapReviewItem(item as Record<string, unknown>, idx))
                .filter((item) => item.content.trim() !== "" || item.photos.length > 0),
            page,
            limit,
            total,
            ratingDistribution,
        };
    },
};
