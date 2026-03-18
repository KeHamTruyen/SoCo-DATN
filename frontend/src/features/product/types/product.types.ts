export interface ProductReviewSummary {
    average: number;
    total: number;
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
    variants?: Array<{
        id: string;
        name: string;
        value: string;
    }>;
}

