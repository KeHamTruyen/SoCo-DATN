export interface CartItemVariant {
    name: string;
    value: string;
}

export interface CartItem {
    id: string;
    productId: string;
    productName: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    variantId?: string | null;
    variants?: CartItemVariant[];
    sellerId: string;
    sellerName: string;
}

export interface CartGroup {
    sellerId: string;
    sellerName: string;
    isTopSeller?: boolean;
    items: CartItem[];
}

export interface Cart {
    id?: string;
    userId?: string;
    items?: CartItem[];
    groups: CartGroup[];
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    itemCount: number;
}

export interface UpdateCartItemPayload {
    cartItemId: string;
    quantity: number;
}
