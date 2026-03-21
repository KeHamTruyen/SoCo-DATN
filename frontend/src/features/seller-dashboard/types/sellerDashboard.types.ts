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
}

export interface SellerProductsListResponse {
    items: SellerProductRow[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
