export type OrderStatus =
    | "pending"
    | "confirmed"
    | "processing"
    | "shipping"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    completed: "Hoàn thành",
    cancelled: "Đã huỷ",
    refunded: "Hoàn tiền",
};

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
    buyerName?: string;
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
    q?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
}

export interface CreateOrderPayload {
    cartItemIds?: string[];
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity?: string;
    shippingDistrict?: string;
    shippingWard?: string;
    shippingNote?: string;
    paymentMethod: "COD" | "BANK_TRANSFER" | "MOMO" | "VNPAY" | "ZALOPAY";
}
