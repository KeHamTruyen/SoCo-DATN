import { httpClient } from "../../../shared/api/httpClient";
import type {
    SellerCategoryOption,
    SellerProductCreatePayload,
    SellerProductDetail,
    SellerProductImageRow,
    SellerProductsListResponse,
    SellerProductRow,
    SellerProductUpdatePayload,
} from "../types/sellerDashboard.types";

interface ApiEnvelope<T> {
    success?: boolean;
    data?: T;
    message?: string;
    pagination?: SellerProductsListResponse["pagination"];
}

function num(v: unknown, fallback = 0): number {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isNaN(n) ? fallback : n;
    }
    return fallback;
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

function unwrapData<T>(res: unknown): T {
    const r = res as ApiEnvelope<T>;
    if (r && typeof r === "object" && "data" in r && r.data !== undefined) {
        return r.data as T;
    }
    return res as T;
}

function mapProduct(p: Record<string, unknown>): SellerProductRow {
    const images = (p.images as { imageUrl?: string }[] | undefined) ?? [];
    const category = p.category as { name?: string } | null | undefined;
    const priceRaw = p.price;
    const price =
        typeof priceRaw === "number" ? priceRaw : Number(priceRaw ?? 0);
    const createdAt = p.createdAt;
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
        createdAt:
            typeof createdAt === "string"
                ? createdAt
                : createdAt instanceof Date
                  ? createdAt.toISOString()
                  : undefined,
        viewsCount:
            typeof p.viewsCount === "number" ? p.viewsCount : Number(p.viewsCount ?? 0),
        salesCount:
            typeof p.salesCount === "number" ? p.salesCount : Number(p.salesCount ?? 0),
    };
}

function mapProductDetail(raw: Record<string, unknown>): SellerProductDetail {
    const imgs = (raw.images as Record<string, unknown>[] | undefined) ?? [];
    const cat = raw.category as { id?: string; name?: string } | null | undefined;
    return {
        id: String(raw.id),
        title: String(raw.title ?? ""),
        slug: String(raw.slug ?? ""),
        description:
            raw.description === null || raw.description === undefined
                ? null
                : String(raw.description),
        price: num(raw.price),
        compareAtPrice:
            raw.compareAtPrice === null || raw.compareAtPrice === undefined
                ? null
                : num(raw.compareAtPrice),
        categoryId:
            raw.categoryId === null || raw.categoryId === undefined
                ? null
                : String(raw.categoryId),
        category:
            cat?.id && cat?.name
                ? { id: String(cat.id), name: String(cat.name) }
                : null,
        stockQuantity: num(raw.stockQuantity, 0),
        lowStockThreshold: num(raw.lowStockThreshold, 10),
        sku: raw.sku === null || raw.sku === undefined ? null : String(raw.sku),
        status: String(raw.status ?? "DRAFT"),
        images: imgs.map((im) => ({
            id: String(im.id),
            imageUrl: String(im.imageUrl ?? ""),
            altText: im.altText === undefined ? null : (im.altText as string | null),
            displayOrder: typeof im.displayOrder === "number" ? im.displayOrder : 0,
            isPrimary: Boolean(im.isPrimary),
        })),
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

    async listCategories(): Promise<SellerCategoryOption[]> {
        const res = await httpClient.get<ApiEnvelope<SellerCategoryOption[]> | SellerCategoryOption[]>(
            "/categories",
        );
        const r = res as ApiEnvelope<SellerCategoryOption[]>;
        const raw = Array.isArray(res) ? res : (r.data ?? []);
        return raw.map((c) => ({ id: String(c.id), name: String(c.name) }));
    },

    async getMyProduct(productId: string): Promise<SellerProductDetail> {
        const res = await httpClient.get<unknown>(`/products/seller/me/${productId}`, {
            requiresAuth: true,
        });
        const data = unwrapData<Record<string, unknown>>(res);
        return mapProductDetail(data);
    },

    async createProduct(body: SellerProductCreatePayload): Promise<SellerProductDetail> {
        const res = await httpClient.post<unknown>("/products", body, {
            requiresAuth: true,
        });
        const data = unwrapData<Record<string, unknown>>(res);
        return mapProductDetail(data);
    },

    async updateProduct(productId: string, body: SellerProductUpdatePayload): Promise<void> {
        await httpClient.put(`/products/${productId}`, body, {
            requiresAuth: true,
        });
    },

    /** Same as updateProduct — kept for call sites that only adjust inventory fields */
    async updateSellerProduct(
        productId: string,
        body: {
            stockQuantity?: number;
            lowStockThreshold?: number;
            status?: string;
        },
    ) {
        await httpClient.put(`/products/${productId}`, body, {
            requiresAuth: true,
        });
    },

    async deleteProduct(productId: string): Promise<void> {
        await httpClient.delete(`/products/${productId}`, { requiresAuth: true });
    },

    async publishProduct(productId: string): Promise<void> {
        await httpClient.post(`/products/${productId}/publish`, undefined, {
            requiresAuth: true,
        });
    },

    async addProductImages(
        productId: string,
        images: { url: string; altText?: string }[],
    ): Promise<SellerProductImageRow[]> {
        const res = await httpClient.post<unknown>(
            `/products/${productId}/images`,
            { images },
            { requiresAuth: true },
        );
        const r = res as ApiEnvelope<Record<string, unknown>[]>;
        const raw = Array.isArray(r.data) ? r.data : [];
        return raw.map((im) => ({
            id: String(im.id ?? ""),
            imageUrl: String(im.imageUrl ?? ""),
            altText: im.altText === undefined ? null : (im.altText as string | null),
        }));
    },

    async deleteProductImage(productId: string, imageId: string): Promise<void> {
        await httpClient.delete(`/products/${productId}/images/${imageId}`, {
            requiresAuth: true,
        });
    },
};
