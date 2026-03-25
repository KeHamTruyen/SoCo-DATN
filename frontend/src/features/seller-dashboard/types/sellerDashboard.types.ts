export interface SellerProductRow {
    id: string;
    title: string;
    slug: string;
    price: number;
    status: string;
    stockQuantity: number;
    lowStockThreshold: number;
    primaryImageUrl?: string;
    categoryName?: string;
    /** ISO date from API */
    createdAt?: string;
    viewsCount?: number;
    salesCount?: number;
}

/** `""` = tất cả trạng thái */
export type SellerShopStatusFilter =
    | ""
    | "DRAFT"
    | "ACTIVE"
    | "OUT_OF_STOCK"
    | "ARCHIVED";

export interface SellerProductsListResponse {
    items: SellerProductRow[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface SellerCategoryOption {
    id: string;
    name: string;
}

export interface SellerProductImageRow {
    id: string;
    imageUrl: string;
    altText?: string | null;
    displayOrder?: number;
    isPrimary?: boolean;
}

/** Full product for seller edit form (GET /products/seller/me/:id) */
export interface SellerProductDetail {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    categoryId: string | null;
    category: { id: string; name: string } | null;
    stockQuantity: number;
    lowStockThreshold: number;
    sku: string | null;
    status: string;
    images: SellerProductImageRow[];
}

export interface SellerProductCreatePayload {
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    categoryId?: string;
    stockQuantity?: number;
    lowStockThreshold?: number;
    sku?: string;
    images?: { url: string; altText?: string }[];
}

export interface SellerProductUpdatePayload {
    title?: string;
    description?: string;
    price?: number;
    compareAtPrice?: number | null;
    categoryId?: string | null;
    stockQuantity?: number;
    lowStockThreshold?: number;
    sku?: string | null;
    status?: string;
}
