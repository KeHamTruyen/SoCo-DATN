export interface ProductListItem {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    rating?: number;
    soldCount?: number;
    sellerName?: string;
    category?: string;
    categoryId?: string;
    metaKeywords?: string[];
}

export interface MarketplaceListResponse {
    items: ProductListItem[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ProductQueryParams {
    q?: string;
    categoryId?: string;
    sort?: "relevance" | "newest" | "price_asc" | "price_desc" | "popular";
    ratingFilter?: "1_plus" | "2_plus" | "3_plus" | "4_plus" | "5_only";
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
    /** Filter public catalog by seller (user id). */
    sellerId?: string;
}

export interface MarketplaceCategoryOption {
    id: string;
    name: string;
}

export interface MarketplaceRecommendationsResponse {
    products: ProductListItem[];
    categories: MarketplaceCategoryOption[];
    tags: string[];
}

