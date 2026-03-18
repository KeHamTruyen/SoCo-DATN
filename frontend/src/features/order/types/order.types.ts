export type OrderStatus =
    | "pending"
    | "confirmed"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "refunded";

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    variantText?: string;
}

export interface OrderTimeline {
    status: OrderStatus;
    timestamp: string;
    note?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
    };
    paymentMethod: "cod" | "bank_transfer" | "e_wallet";
    sellerName?: string;
    timeline?: OrderTimeline[];
    trackingNumber?: string;
}

export interface OrdersListResponse {
    items: Order[];
    total: number;
    page: number;
    pageSize: number;
}

export interface OrdersQueryParams {
    status?: OrderStatus | "all";
    page?: number;
    pageSize?: number;
}

export interface CreateOrderPayload {
    cartItemIds: string[];
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
    };
    paymentMethod: "cod" | "bank_transfer" | "e_wallet";
}
