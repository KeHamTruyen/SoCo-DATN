import { httpClient } from "../../../shared/api/httpClient";
import type { Cart } from "../types/cart.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

export const cartApi = {
    async getCart() {
        const res = await httpClient.get<ApiResponse<Cart> | Cart>("/cart", {
            requiresAuth: true,
        });
        return unwrap<Cart>(res);
    },
    async addItem(productId: string, quantity: number, variantId?: string) {
        const res = await httpClient.post<ApiResponse<Cart> | Cart>(
            "/cart/items",
            { productId, quantity, variantId },
            { requiresAuth: true },
        );
        return unwrap<Cart>(res);
    },
    async updateItem(cartItemId: string, quantity: number) {
        const res = await httpClient.patch<ApiResponse<Cart> | Cart>(
            `/cart/items/${cartItemId}`,
            { quantity },
            { requiresAuth: true },
        );
        return unwrap<Cart>(res);
    },
    async removeItem(cartItemId: string) {
        const res = await httpClient.delete<ApiResponse<Cart> | Cart>(
            `/cart/items/${cartItemId}`,
            { requiresAuth: true },
        );
        return unwrap<Cart>(res);
    },
    async clearCart() {
        const res = await httpClient.delete<ApiResponse<Cart> | Cart>("/cart", {
            requiresAuth: true,
        });
        return unwrap<Cart>(res);
    },
};
