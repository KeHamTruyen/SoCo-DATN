import { httpClient } from "../../../shared/api/httpClient";
import type {
    MarketplaceListResponse,
    ProductQueryParams,
} from "../types/marketplace.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

export const marketplaceApi = {
    async listProducts(params: ProductQueryParams) {
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.set("q", params.q);
        if (params.category) searchParams.set("category", params.category);
        if (params.sort) searchParams.set("sort", params.sort);
        searchParams.set("page", String(params.page ?? 1));
        searchParams.set("pageSize", String(params.pageSize ?? 12));
        const res = await httpClient.get<
            ApiResponse<MarketplaceListResponse> | MarketplaceListResponse
        >(`/products?${searchParams.toString()}`, {
            requiresAuth: true,
        });
        return unwrap<MarketplaceListResponse>(res);
    },
};

