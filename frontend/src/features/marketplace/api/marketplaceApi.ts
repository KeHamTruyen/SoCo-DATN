import { httpClient } from "../../../shared/api/httpClient";
import type {
    MarketplaceCategoryOption,
    MarketplaceListResponse,
    MarketplaceRecommendationsResponse,
    ProductListItem,
    ProductQueryParams,
} from "../types/marketplace.types";

interface ProductsListEnvelope {
    success?: boolean;
    data?: unknown;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface RecommendationEnvelope {
    data?: {
        products?: unknown[];
        categories?: Array<{ id?: unknown; name?: unknown }>;
        tags?: unknown[];
        pagination?: {
            page?: number;
            limit?: number;
            total?: number;
            totalPages?: number;
            hasMore?: boolean;
        };
    };
    pagination?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        hasMore?: boolean;
    };
}

function sortToBackend(sort: ProductQueryParams["sort"] | undefined) {
    switch (sort) {
        case "relevance":
            return { sortBy: "salesCount", sortOrder: "desc" as const };
        case "price_asc":
            return { sortBy: "price", sortOrder: "asc" as const };
        case "price_desc":
            return { sortBy: "price", sortOrder: "desc" as const };
        case "popular":
            return { sortBy: "salesCount", sortOrder: "desc" as const };
        case "newest":
        default:
            return { sortBy: "createdAt", sortOrder: "desc" as const };
    }
}

function mapApiProductToListItem(raw: Record<string, unknown>): ProductListItem {
    const images = (raw.images as { imageUrl?: string }[] | undefined) ?? [];
    const seller = raw.seller as { fullName?: string; username?: string } | undefined;
    const categories = Array.isArray(raw.categories)
        ? (raw.categories as Array<{ id?: string; name?: string }>)
        : [];
    const priceRaw = raw.price;
    const price =
        typeof priceRaw === "number"
            ? priceRaw
            : typeof priceRaw === "string"
              ? parseFloat(priceRaw)
              : NaN;

    return {
        id: String(raw.id ?? ""),
        name: String(raw.title ?? ""),
        price: Number.isFinite(price) ? price : 0,
        imageUrl: images[0]?.imageUrl,
        sellerName: seller?.fullName ?? seller?.username,
        category: categories[0]?.name,
        categoryId: categories[0]?.id ? String(categories[0]?.id) : undefined,
        metaKeywords: Array.isArray(raw.metaKeywords)
            ? (raw.metaKeywords as unknown[])
                  .map((value) => String(value ?? "").trim())
                  .filter((value) => value.length > 0)
            : [],
        soldCount: typeof raw.salesCount === "number" ? raw.salesCount : undefined,
    };
}

export const marketplaceApi = {
    async listProducts(params: ProductQueryParams): Promise<MarketplaceListResponse> {
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.set("search", params.q);
        if (params.categoryId) searchParams.set("categoryId", params.categoryId);
        if (params.minPrice != null && params.minPrice > 0) {
            searchParams.set("minPrice", String(params.minPrice));
        }
        if (params.maxPrice != null && params.maxPrice > 0) {
            searchParams.set("maxPrice", String(params.maxPrice));
        }
        if (params.ratingFilter) {
            searchParams.set("ratingFilter", params.ratingFilter);
        }
        const { sortBy, sortOrder } = sortToBackend(params.sort);
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
        searchParams.set("page", String(params.page ?? 1));
        searchParams.set("limit", String(params.pageSize ?? 12));
        searchParams.set("status", "ACTIVE");
        if (params.sellerId?.trim()) {
            searchParams.set("sellerId", params.sellerId.trim());
        }

        const res = await httpClient.get<ProductsListEnvelope>(
            `/products?${searchParams.toString()}`,
            {
                requiresAuth: false,
            },
        );

        const rawList = Array.isArray(res.data) ? res.data : [];
        const pagination = res.pagination;

        return {
            items: rawList.map((row) =>
                mapApiProductToListItem(row as Record<string, unknown>),
            ),
            total: pagination?.total ?? rawList.length,
            page: pagination?.page ?? (params.page ?? 1),
            pageSize: pagination?.limit ?? (params.pageSize ?? 12),
        };
    },
    async listCategories(options?: {
        onlyWithPublishedProducts?: boolean;
    }): Promise<MarketplaceCategoryOption[]> {
        const query = new URLSearchParams();
        if (options?.onlyWithPublishedProducts) {
            query.set("onlyWithPublishedProducts", "true");
        }
        const path = query.toString() ? `/categories?${query.toString()}` : "/categories";
        const response = await httpClient.get<
            { data?: Array<{ id?: unknown; name?: unknown }> } | Array<{ id?: unknown; name?: unknown }>
        >(path);
        const raw = Array.isArray(response)
            ? response
            : Array.isArray(response.data)
              ? response.data
              : [];
        return raw
            .map((category) => ({
                id: String(category.id ?? ""),
                name: String(category.name ?? ""),
            }))
            .filter((category) => category.id && category.name);
    },
    async trackSearchEvent(query: string): Promise<void> {
        await httpClient.post(
            "/products/search-events",
            { query },
            { requiresAuth: true },
        );
    },
    async trackProductView(
        productId: string,
        payload?: { sessionId?: string; previousProductId?: string },
    ): Promise<void> {
        await httpClient.post(
            `/products/${productId}/view`,
            payload ?? {},
            { requiresAuth: true },
        );
    },
    async getRecommendations(
        options: { page?: number; limit?: number } = {},
    ): Promise<MarketplaceRecommendationsResponse> {
        const page = options.page ?? 1;
        const limit = options.limit ?? 24;
        const res = await httpClient.get<RecommendationEnvelope>(
            `/products/recommendations/me?page=${page}&limit=${limit}`,
            { requiresAuth: true },
        );
        const data = res.data ?? {};
        const rawProducts = Array.isArray(data.products) ? data.products : [];
        const categories = Array.isArray(data.categories)
            ? data.categories
                  .map((category) => ({
                      id: String(category.id ?? ""),
                      name: String(category.name ?? ""),
                  }))
                  .filter((category) => category.id && category.name)
            : [];
        const tags = Array.isArray(data.tags)
            ? data.tags
                  .map((tag) => String(tag ?? "").trim())
                  .filter((tag) => tag.length > 0)
            : [];
        const pagination = data.pagination ?? res.pagination;
        const currentPage = pagination?.page ?? page;
        const pageSize = pagination?.limit ?? limit;
        const total = pagination?.total ?? rawProducts.length;
        const hasMore =
            typeof pagination?.hasMore === "boolean"
                ? pagination.hasMore
                : currentPage * pageSize < total;

        return {
            products: rawProducts.map((row) =>
                mapApiProductToListItem(row as Record<string, unknown>),
            ),
            categories,
            tags,
            total,
            page: currentPage,
            pageSize,
            hasMore,
        };
    },
};
