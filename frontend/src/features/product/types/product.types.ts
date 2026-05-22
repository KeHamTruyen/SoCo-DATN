export interface ProductReviewSummary {
    average: number;
    total: number;
}

export interface ProductReviewPhoto {
    id: string;
    imageUrl: string;
}

export interface ProductReviewAuthor {
    id: string;
    name: string;
    avatarUrl?: string;
}

export interface ProductReviewItem {
    id: string;
    rating: number;
    title?: string;
    content: string;
    createdAt: string;
    helpfulCount: number;
    author: ProductReviewAuthor;
    isVerifiedBuyer: boolean;
    photos: ProductReviewPhoto[];
    sellerResponse?: string;
    sellerResponseAt?: string;
}

export interface ProductReviewsResponse {
    items: ProductReviewItem[];
    page: number;
    limit: number;
    total: number;
    ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ProductReviewFilters {
    rating?: 1 | 2 | 3 | 4 | 5;
    hasMedia?: boolean;
    hasSellerReply?: boolean;
    sortBy?: "createdAt" | "rating" | "helpfulCount";
    sortOrder?: "asc" | "desc";
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
    salesCount?: number;
    viewsCount?: number;
    sku?: string;
    stockQuantity?: number;
    categoryName?: string;
    rating?: ProductReviewSummary;
    seller?: {
        id: string;
        name: string;
        avatarUrl?: string;
        followersCount?: number;
        shopRating?: number;
        isFollowing?: boolean;
    };
    variants?: ProductVariantRow[];
}

