export interface ProductListItem {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    rating?: number;
    soldCount?: number;
    sellerName?: string;
    category?: string;
}

export interface MarketplaceListResponse {
    items: ProductListItem[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ProductQueryParams {
    q?: string;
    category?: string;
    sort?: "newest" | "price_asc" | "price_desc" | "popular";
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
    /** Filter public catalog by seller (user id). */
    sellerId?: string;
}

