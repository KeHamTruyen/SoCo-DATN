import { httpClient } from "../../../shared/api/httpClient";
import type {
    MarketplaceListResponse,
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

function sortToBackend(sort: ProductQueryParams["sort"] | undefined) {
    switch (sort) {
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
    const category = raw.category as { name?: string } | null | undefined;
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
        category: category?.name,
        soldCount: typeof raw.salesCount === "number" ? raw.salesCount : undefined,
    };
}

export const marketplaceApi = {
    async listProducts(params: ProductQueryParams): Promise<MarketplaceListResponse> {
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.set("search", params.q);
        if (params.minPrice != null && params.minPrice > 0) {
            searchParams.set("minPrice", String(params.minPrice));
        }
        if (params.maxPrice != null && params.maxPrice > 0) {
            searchParams.set("maxPrice", String(params.maxPrice));
        }
        const { sortBy, sortOrder } = sortToBackend(params.sort);
        searchParams.set("sortBy", sortBy);
        searchParams.set("sortOrder", sortOrder);
        searchParams.set("page", String(params.page ?? 1));
        searchParams.set("limit", String(params.pageSize ?? 12));
        if (params.sellerId?.trim()) {
            searchParams.set("sellerId", params.sellerId.trim());
            searchParams.set("status", "ACTIVE");
        }

        const res = await httpClient.get<ProductsListEnvelope>(
            `/products?${searchParams.toString()}`,
            {
                requiresAuth: true,
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
};
