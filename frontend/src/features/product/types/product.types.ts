export interface ProductReviewSummary {
    average: number;
    total: number;
}

/** Storefront row mapped from ProductVariant */
export interface ProductVariantRow {
    id: string;
    name: string;
    value: string;
    price: number | null;
    stockQuantity: number;
    isActive?: boolean;
}

export interface ProductDetail {
    id: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number;
    images: string[];
    rating?: ProductReviewSummary;
    seller?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    variants?: ProductVariantRow[];
}

