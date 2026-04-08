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
    /** ISO date from API */
    updatedAt?: string;
    viewsCount?: number;
    salesCount?: number;
    deletedAt?: string | null;
    purgeAfter?: string | null;
    deletionState?: string;
}

/** `""` = tất cả trạng thái */
export type SellerShopStatusFilter =
    | ""
    | "DRAFT"
    | "ACTIVE"
    | "OUT_OF_STOCK"
    | "ARCHIVED"
    | "DELETED";

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

/** Stored as Product.dimensions JSON — matches seller form (cm). */
export interface SellerProductDimensions {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
}

export interface SellerProductVariantRow {
    id: string;
    variantName: string;
    sku: string | null;
    price: number | null;
    stockQuantity: number;
    /** Attribute map, e.g. { Color: "Red", Size: "M" } */
    options: Record<string, string>;
    isActive: boolean;
}

/** Full product for seller edit form (GET /products/seller/me/:id) */
export interface SellerProductDetail {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    costPrice: number | null;
    categoryIds: string[];
    categories: Array<{ id: string; name: string }>;
    stockQuantity: number;
    lowStockThreshold: number;
    trackInventory: boolean;
    sku: string | null;
    weight: number | null;
    dimensions: SellerProductDimensions | null;
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string[];
    status: string;
    images: SellerProductImageRow[];
    variants: SellerProductVariantRow[];
}

export interface SellerProductCreatePayload {
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    categoryIds?: string[];
    stockQuantity?: number;
    lowStockThreshold?: number;
    trackInventory?: boolean;
    sku?: string;
    weight?: number;
    dimensions?: SellerProductDimensions | null;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    images?: { url: string; altText?: string }[];
    variants?: Array<{
        name: string;
        sku?: string;
        price?: number;
        stockQuantity?: number;
        options?: Record<string, string>;
    }>;
}

export interface SellerProductUpdatePayload {
    title?: string;
    description?: string;
    price?: number;
    compareAtPrice?: number | null;
    costPrice?: number | null;
    categoryIds?: string[];
    stockQuantity?: number;
    lowStockThreshold?: number;
    trackInventory?: boolean;
    sku?: string | null;
    weight?: number | null;
    dimensions?: SellerProductDimensions | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string[] | null;
    status?: string;
}
