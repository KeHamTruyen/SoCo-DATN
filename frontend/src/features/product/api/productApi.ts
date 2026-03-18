import { httpClient } from "../../../shared/api/httpClient";
import type { ProductDetail } from "../types/product.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

export const productApi = {
    async getProductDetail(productId: string) {
        const res = await httpClient.get<ApiResponse<ProductDetail> | ProductDetail>(
            `/products/${productId}`,
            { requiresAuth: true },
        );
        return unwrap<ProductDetail>(res);
    },
};

