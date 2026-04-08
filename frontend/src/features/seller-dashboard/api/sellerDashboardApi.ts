import { httpClient } from "../../../shared/api/httpClient";
import type {
    SellerCategoryOption,
    SellerProductCreatePayload,
    SellerProductDetail,
    SellerProductDimensions,
    SellerProductImageRow,
    SellerProductVariantRow,
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

function numOrNull(v: unknown): number | null {
    if (v === null || v === undefined) return null;
    const n = num(v, NaN);
    return Number.isFinite(n) ? n : null;
}

function mapDimensions(raw: unknown): SellerProductDimensions | null {
    if (raw === null || raw === undefined) return null;
    if (typeof raw !== "object" || Array.isArray(raw)) return null;
    const o = raw as Record<string, unknown>;
    const length = num(o.length, NaN);
    const width = num(o.width, NaN);
    const height = num(o.height, NaN);
    const unit = typeof o.unit === "string" && o.unit.trim() !== "" ? o.unit.trim() : undefined;
    const hasNum =
        Number.isFinite(length) || Number.isFinite(width) || Number.isFinite(height);
    if (!hasNum && !unit) return null;
    const out: SellerProductDimensions = {};
    if (Number.isFinite(length)) out.length = length;
    if (Number.isFinite(width)) out.width = width;
    if (Number.isFinite(height)) out.height = height;
    if (unit) out.unit = unit;
    return out;
}

function mapMetaKeywords(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((k) => (typeof k === "string" ? k.trim() : String(k)))
        .filter((k) => k.length > 0);
}

function asIsoStringOrNull(v: unknown): string | null {
    if (typeof v === "string") return v;
    if (v instanceof Date) return v.toISOString();
    return null;
}

function asIsoStringOrUndefined(v: unknown): string | undefined {
    if (typeof v === "string") return v;
    if (v instanceof Date) return v.toISOString();
    return undefined;
}

function mapImageRow(im: Record<string, unknown>): SellerProductImageRow {
    return {
        id: String(im.id ?? ""),
        imageUrl: String(im.imageUrl ?? ""),
        altText: im.altText === undefined ? null : (im.altText as string | null),
        displayOrder: typeof im.displayOrder === "number" ? im.displayOrder : 0,
        isPrimary: Boolean(im.isPrimary),
    };
}

function mapVariantRow(v: Record<string, unknown>): SellerProductVariantRow {
    const opts = v.options;
    const options: Record<string, string> = {};
    if (opts && typeof opts === "object" && !Array.isArray(opts)) {
        for (const [k, val] of Object.entries(opts as Record<string, unknown>)) {
            options[k] = String(val ?? "");
        }
    }
    return {
        id: String(v.id ?? ""),
        variantName: String(v.variantName ?? ""),
        sku: v.sku == null || v.sku === undefined ? null : String(v.sku),
        price: numOrNull(v.price),
        stockQuantity: num(v.stockQuantity, 0),
        options,
        isActive: v.isActive !== false,
    };
}

function mapVariants(raw: unknown): SellerProductVariantRow[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((v) => mapVariantRow(v as Record<string, unknown>));
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
    const categoriesRaw = Array.isArray(p.categories) ? (p.categories as Array<{ name?: string }>) : [];
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
        categoryName: categoriesRaw[0]?.name,
        createdAt: asIsoStringOrUndefined(p.createdAt),
        updatedAt: asIsoStringOrUndefined(p.updatedAt),
        viewsCount:
            typeof p.viewsCount === "number" ? p.viewsCount : Number(p.viewsCount ?? 0),
        salesCount:
            typeof p.salesCount === "number" ? p.salesCount : Number(p.salesCount ?? 0),
        deletedAt: asIsoStringOrNull(p.deletedAt),
        purgeAfter: asIsoStringOrNull(p.purgeAfter),
        deletionState: typeof p.deletionState === "string" ? p.deletionState : undefined,
    };
}

function mapProductDetail(raw: Record<string, unknown>): SellerProductDetail {
    const imgs = (raw.images as Record<string, unknown>[] | undefined) ?? [];
    const categoriesRaw = Array.isArray(raw.categories)
        ? (raw.categories as Array<{ id?: string; name?: string }>)
        : [];
    const tr = raw.trackInventory;
    const trackInventory =
        tr === false || tr === "false" ? false : true;
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
        costPrice: numOrNull(raw.costPrice),
        categoryIds: categoriesRaw.map((category) => String(category.id ?? "")).filter(Boolean),
        categories: categoriesRaw
            .filter((category) => category.id && category.name)
            .map((category) => ({ id: String(category.id), name: String(category.name) })),
        stockQuantity: num(raw.stockQuantity, 0),
        lowStockThreshold: num(raw.lowStockThreshold, 10),
        trackInventory,
        sku: raw.sku === null || raw.sku === undefined ? null : String(raw.sku),
        weight: numOrNull(raw.weight),
        dimensions: mapDimensions(raw.dimensions),
        metaTitle:
            raw.metaTitle === null || raw.metaTitle === undefined
                ? null
                : String(raw.metaTitle),
        metaDescription:
            raw.metaDescription === null || raw.metaDescription === undefined
                ? null
                : String(raw.metaDescription),
        metaKeywords: mapMetaKeywords(raw.metaKeywords),
        status: String(raw.status ?? "DRAFT"),
        images: imgs.map(mapImageRow),
        variants: mapVariants(raw.variants),
    };
}

export const sellerDashboardApi = {
    async listMyProducts(params: { page?: number; limit?: number; status?: string; includeDeleted?: boolean } = {}) {
        const q = new URLSearchParams();
        if (params.page) q.set("page", String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        if (params.status) q.set("status", params.status);
        if (params.includeDeleted) q.set("includeDeleted", "true");
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

    async restoreProduct(productId: string): Promise<void> {
        await httpClient.post(`/products/${productId}/restore`, undefined, {
            requiresAuth: true,
        });
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
        return raw.map(mapImageRow);
    },

    async deleteProductImage(productId: string, imageId: string): Promise<void> {
        await httpClient.delete(`/products/${productId}/images/${imageId}`, {
            requiresAuth: true,
        });
    },

    async listProductVariants(productId: string): Promise<SellerProductVariantRow[]> {
        const res = await httpClient.get<unknown>(
            `/products/seller/me/${productId}/variants`,
            { requiresAuth: true },
        );
        const data = unwrapData<Record<string, unknown>[]>(res);
        return Array.isArray(data) ? data.map((row) => mapVariantRow(row)) : [];
    },

    async createProductVariant(
        productId: string,
        body: {
            name: string;
            sku?: string;
            price?: number;
            stockQuantity?: number;
            options?: Record<string, string>;
            isActive?: boolean;
        },
    ): Promise<SellerProductVariantRow> {
        const res = await httpClient.post<unknown>(
            `/products/seller/me/${productId}/variants`,
            body,
            { requiresAuth: true },
        );
        const data = unwrapData<Record<string, unknown>>(res);
        return mapVariantRow(data);
    },

    async updateProductVariant(
        productId: string,
        variantId: string,
        body: {
            name?: string;
            sku?: string | null;
            price?: number | null;
            stockQuantity?: number;
            options?: Record<string, string>;
            isActive?: boolean;
        },
    ): Promise<SellerProductVariantRow> {
        const res = await httpClient.put<unknown>(
            `/products/seller/me/${productId}/variants/${variantId}`,
            body,
            { requiresAuth: true },
        );
        const data = unwrapData<Record<string, unknown>>(res);
        return mapVariantRow(data);
    },

    async deleteProductVariant(productId: string, variantId: string): Promise<void> {
        await httpClient.delete(
            `/products/seller/me/${productId}/variants/${variantId}`,
            { requiresAuth: true },
        );
    },
};
