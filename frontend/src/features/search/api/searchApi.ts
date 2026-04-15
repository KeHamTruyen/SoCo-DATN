import { httpClient } from "../../../shared/api/httpClient";

type SearchType = "products" | "users" | "posts";

export interface UnifiedSearchResponse {
    products: { items: unknown[]; total: number; page: number; limit: number };
    users: { items: unknown[]; total: number; page: number; limit: number };
    posts: { items: unknown[]; total: number; page: number; limit: number };
}

interface SearchApiResponse {
    success: boolean;
    query: string;
    data: UnifiedSearchResponse;
}

export const searchApi = {
    async search(
        q: string,
        options: { page?: number; limit?: number; types?: SearchType[] } = {},
    ): Promise<UnifiedSearchResponse> {
        const params = new URLSearchParams();
        params.set("q", q);
        if (options.page) params.set("page", String(options.page));
        if (options.limit) params.set("limit", String(options.limit));
        if (options.types && options.types.length > 0) {
            params.set("types", options.types.join(","));
        }
        const response = await httpClient.get<SearchApiResponse>(
            `/search?${params.toString()}`,
            { requiresAuth: true },
        );
        return response.data;
    },
};
