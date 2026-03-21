import { httpClient } from "../../../shared/api/httpClient";
import type { SellerProductsListResponse, SellerProductRow } from "../types/sellerDashboard.types";

interface ApiEnvelope<T> {
    success?: boolean;
    data?: T;
    pagination?: SellerProductsListResponse["pagination"];
}

function unwrapList(res: unknown): SellerProductsListResponse {
    const r = res as ApiEnvelope<Record<string, unknown>[]>;
    const raw = Array.isArray(r) ? r : ((r.data as Record<string, unknown>[]) ?? []);
    const pagination = !Array.isArray(r) && r.pagination
        ? r.pagination
        : { page: 1, limit: 20, total: raw.length, totalPages: 1 };
    const items = raw.map((row) => mapProduct(row));
    return { items, pagination };
}

function mapProduct(p: Record<string, unknown>): SellerProductRow {
    const images = (p.images as { imageUrl?: string }[] | undefined) ?? [];
    const category = p.category as { name?: string } | null | undefined;
    const priceRaw = p.price;
    const price =
        typeof priceRaw === "number" ? priceRaw : Number(priceRaw ?? 0);
    return {
        id: String(p.id),
        title: String(p.title ?? ""),
        slug: String(p.slug ?? ""),
        price,
        status: String(p.status ?? ""),
        stockQuantity: Number(p.stockQuantity ?? 0),
        lowStockThreshold: Number(p.lowStockThreshold ?? 10),
        primaryImageUrl: images[0]?.imageUrl,
        categoryName: category?.name,
    };
}

export const sellerDashboardApi = {
    async listMyProducts(params: { page?: number; limit?: number; status?: string } = {}) {
        const q = new URLSearchParams();
        if (params.page) q.set("page", String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        if (params.status) q.set("status", params.status);
        const qs = q.toString();
        const res = await httpClient.get<unknown>(
            `/products/seller/me${qs ? `?${qs}` : ""}`,
            { requiresAuth: true },
        );
        return unwrapList(res);
    },
};
