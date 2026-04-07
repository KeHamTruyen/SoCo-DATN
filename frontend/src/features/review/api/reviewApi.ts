import { httpClient } from "../../../shared/api/httpClient";

type ApiResponse<T> = {
    data?: T;
    message?: string;
};

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

export interface CreateReviewPayload {
    orderItemId: string;
    rating: number;
    title?: string;
    content?: string;
    images?: string[];
}

export interface ReviewEntity {
    id: string;
    orderItemId: string;
    productId: string;
    rating: number;
    title?: string | null;
    content?: string | null;
    images?: string[];
}

export const reviewApi = {
    async createReview(payload: CreateReviewPayload) {
        const res = await httpClient.post<ApiResponse<ReviewEntity> | ReviewEntity>(
            "/reviews",
            payload,
            { requiresAuth: true },
        );
        return unwrap<ReviewEntity>(res);
    },
};
