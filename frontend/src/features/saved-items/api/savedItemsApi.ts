import { httpClient } from "../../../shared/api/httpClient";
import type { SavedItemRow, SavedItemsPagination, SavedItemType, SavedTab } from "../types/savedItems.types";

export type PriceSort = "recent" | "price_asc" | "price_desc";

interface ListEnvelope {
    success?: boolean;
    data: SavedItemRow[];
    pagination: SavedItemsPagination;
}

interface SaveEnvelope {
    success?: boolean;
    data?: { id: string; itemType: SavedItemType; targetId: string; createdAt: string };
}

interface LookupEnvelope {
    success?: boolean;
    data?: { id: string | null };
}

function buildQuery(params: {
    type: SavedTab;
    page: number;
    limit: number;
    q?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    sort: PriceSort;
}) {
    const sp = new URLSearchParams();
    sp.set("type", params.type);
    sp.set("page", String(params.page));
    sp.set("limit", String(params.limit));
    sp.set("sort", params.sort);
    if (params.q?.trim()) sp.set("q", params.q.trim());
    if (params.categoryId) sp.set("categoryId", params.categoryId);
    if (params.minPrice) sp.set("minPrice", params.minPrice);
    if (params.maxPrice) sp.set("maxPrice", params.maxPrice);
    return sp.toString();
}

export const savedItemsApi = {
    async list(params: {
        type: SavedTab;
        page?: number;
        limit?: number;
        q?: string;
        categoryId?: string;
        minPrice?: string;
        maxPrice?: string;
        sort?: PriceSort;
    }) {
        const res = await httpClient.get<ListEnvelope>(
            `/saved-items?${buildQuery({
                type: params.type,
                page: params.page ?? 1,
                limit: params.limit ?? 24,
                q: params.q,
                categoryId: params.categoryId,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
                sort: params.sort ?? "recent",
            })}`,
            { requiresAuth: true },
        );
        return {
            items: res.data ?? [],
            pagination: res.pagination,
        };
    },

    async save(itemType: SavedItemType, targetId: string) {
        const res = await httpClient.post<SaveEnvelope>(
            "/saved-items",
            { itemType, targetId },
            { requiresAuth: true },
        );
        return res.data!;
    },

    async remove(savedItemId: string) {
        await httpClient.delete(`/saved-items/${savedItemId}`, { requiresAuth: true });
    },

    async lookup(itemType: SavedItemType, targetId: string) {
        const sp = new URLSearchParams({ itemType, targetId });
        const res = await httpClient.get<LookupEnvelope>(`/saved-items/lookup?${sp}`, {
            requiresAuth: true,
        });
        return res.data?.id ?? null;
    },

    async lookupBatch(itemType: SavedItemType, targetIds: string[]) {
        if (targetIds.length === 0) return {} as Record<string, string | null>;
        const sp = new URLSearchParams({
            itemType,
            targetIds: [...new Set(targetIds)].join(","),
        });
        const res = await httpClient.get<{
            success?: boolean;
            data?: { byTargetId?: Record<string, string | null> };
        }>(`/saved-items/lookup-batch?${sp}`, { requiresAuth: true });
        return res.data?.byTargetId ?? {};
    },
};
