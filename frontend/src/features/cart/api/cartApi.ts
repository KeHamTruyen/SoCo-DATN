import { httpClient } from "../../../shared/api/httpClient";
import type { Cart, CartGroup, CartItem, CartItemVariant } from "../types/cart.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

function mapVariants(options: unknown): CartItemVariant[] | undefined {
    if (!options || typeof options !== "object" || Array.isArray(options)) return undefined;
    const rows = Object.entries(options as Record<string, unknown>)
        .map(([name, value]) => ({ name, value: String(value) }))
        .filter((row) => row.value.trim() !== "");
    return rows.length > 0 ? rows : undefined;
}

function normalizeCart(raw: Record<string, unknown>): Cart {
    const itemsRaw = Array.isArray(raw.items) ? (raw.items as Record<string, unknown>[]) : [];
    const normalizedItems: CartItem[] = itemsRaw.map((item) => {
        const product = (item.product as Record<string, unknown> | undefined) ?? {};
        const seller = (product.seller as Record<string, unknown> | undefined) ?? {};
        return {
            id: String(item.id ?? ""),
            productId: String(item.productId ?? product.id ?? ""),
            productName: String(product.title ?? product.name ?? ""),
            imageUrl: (product.images as { imageUrl?: string }[] | undefined)?.[0]?.imageUrl,
            price: Number(item.price ?? product.price ?? 0),
            quantity: Number(item.quantity ?? 1),
            variantId: (item.variantId as string | null | undefined) ?? null,
            variants: mapVariants((item.variant as { options?: unknown } | undefined)?.options),
            sellerId: String(product.sellerId ?? seller.id ?? ""),
            sellerName: String(seller.fullName ?? seller.username ?? "Unknown seller"),
        };
    });

    const groupMap = new Map<string, CartGroup>();
    normalizedItems.forEach((item) => {
        const key = item.sellerId || "unknown-seller";
        const group = groupMap.get(key) ?? {
            sellerId: key,
            sellerName: item.sellerName,
            items: [],
        };
        group.items.push(item);
        groupMap.set(key, group);
    });
    const groups = Array.from(groupMap.values());

    const subtotal = Number(raw.subtotal ?? 0);
    const shipping = 0;
    const discount = 0;
    return {
        id: typeof raw.id === "string" ? raw.id : undefined,
        userId: typeof raw.userId === "string" ? raw.userId : undefined,
        items: normalizedItems,
        groups,
        subtotal,
        shipping,
        discount,
        total: subtotal + shipping - discount,
        itemCount: Number(raw.totalItems ?? normalizedItems.reduce((s, i) => s + i.quantity, 0)),
    };
}

export const cartApi = {
    async getCart() {
        const res = await httpClient.get<ApiResponse<Cart> | Cart>("/cart", {
            requiresAuth: true,
        });
        const data = unwrap<Record<string, unknown>>(res as ApiResponse<Record<string, unknown>> | Record<string, unknown>);
        return normalizeCart(data);
    },
    async addItem(productId: string, quantity: number, variantId?: string) {
        const res = await httpClient.post<ApiResponse<Cart> | Cart>(
            "/cart/items",
            { productId, quantity, variantId },
            { requiresAuth: true },
        );
        const data = unwrap<Record<string, unknown>>(res as ApiResponse<Record<string, unknown>> | Record<string, unknown>);
        return normalizeCart(data);
    },
    async updateItem(cartItemId: string, quantity: number) {
        const res = await httpClient.put<ApiResponse<Cart> | Cart>(
            `/cart/items/${cartItemId}`,
            { quantity },
            { requiresAuth: true },
        );
        const data = unwrap<Record<string, unknown>>(res as ApiResponse<Record<string, unknown>> | Record<string, unknown>);
        return normalizeCart(data);
    },
    async removeItem(cartItemId: string) {
        const res = await httpClient.delete<ApiResponse<Cart> | Cart>(
            `/cart/items/${cartItemId}`,
            { requiresAuth: true },
        );
        const data = unwrap<Record<string, unknown>>(res as ApiResponse<Record<string, unknown>> | Record<string, unknown>);
        return normalizeCart(data);
    },
    async clearCart() {
        const res = await httpClient.delete<ApiResponse<Cart> | Cart>("/cart", {
            requiresAuth: true,
        });
        const data = unwrap<Record<string, unknown>>(res as ApiResponse<Record<string, unknown>> | Record<string, unknown>);
        return normalizeCart(data);
    },
};
