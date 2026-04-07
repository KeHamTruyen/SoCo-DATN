export type SavedItemType = "POST" | "PRODUCT";

export interface SavedItemAuthor {
    id: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
    role?: string;
}

export interface SavedPostProductSnippet {
    id: string;
    title: string;
    price: unknown;
    images?: { imageUrl?: string; altText?: string | null }[];
}

export interface SavedPostPayload {
    id: string;
    content?: string | null;
    mediaUrls: string[];
    mediaType?: string | null;
    createdAt: string;
    author: SavedItemAuthor;
    product?: SavedPostProductSnippet | null;
    likesCount?: number;
    commentsCount?: number;
    _count?: { likes: number; comments: number };
}

export interface SavedProductPayload {
    id: string;
    title: string;
    price: number | null;
    categoryId?: string | null;
    status?: string;
    salesCount?: number;
    images?: { imageUrl?: string; altText?: string | null }[];
    category?: { id: string; name: string } | null;
    seller?: SavedItemAuthor | null;
}

export interface SavedItemRow {
    id: string;
    itemType: SavedItemType;
    createdAt: string;
    post?: SavedPostPayload;
    product?: SavedProductPayload;
}

export interface SavedItemsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export type SavedTab = "all" | "posts" | "products";
export type PriceSort = "recent" | "price_asc" | "price_desc";
