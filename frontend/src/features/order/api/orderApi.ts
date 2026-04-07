import { httpClient } from "../../../shared/api/httpClient";
import type {
    CreateOrderPayload,
    Order,
    OrderStatus,
    OrdersListResponse,
    OrdersQueryParams,
} from "../types/order.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

function num(value: unknown, fallback = 0): number {
    if (typeof value === "number" && !Number.isNaN(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
}

function normalizePaymentMethod(raw: unknown): Order["paymentMethod"] {
    const value = String(raw ?? "").toUpperCase();
    if (value === "BANK_TRANSFER") return "bank_transfer";
    if (value === "MOMO" || value === "VNPAY" || value === "ZALOPAY") return "e_wallet";
    return "cod";
}

function normalizeOrder(raw: Record<string, unknown>): Order {
    const itemsRaw = Array.isArray(raw.items) ? (raw.items as Record<string, unknown>[]) : [];
    const items = itemsRaw.map((item) => {
        const product = (item.product as Record<string, unknown> | undefined) ?? {};
        const variantInfo = item.variantInfo;
        const variantText =
            variantInfo && typeof variantInfo === "object" && !Array.isArray(variantInfo)
                ? Object.entries(variantInfo as Record<string, unknown>)
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join(" | ")
                : undefined;
        return {
            id: String(item.id ?? ""),
            productId: String(item.productId ?? product.id ?? ""),
            productName: String(item.productName ?? product.title ?? product.name ?? ""),
            imageUrl:
                typeof item.productImageUrl === "string"
                    ? item.productImageUrl
                    : undefined,
            price: num(item.unitPrice ?? item.price, 0),
            quantity: num(item.quantity, 1),
            variantText: variantText || undefined,
            review:
                item.review && typeof item.review === "object"
                    ? {
                          id: String((item.review as Record<string, unknown>).id ?? ""),
                          rating: num((item.review as Record<string, unknown>).rating, 0),
                          title:
                              typeof (item.review as Record<string, unknown>).title === "string"
                                  ? String((item.review as Record<string, unknown>).title)
                                  : undefined,
                          content:
                              typeof (item.review as Record<string, unknown>).content === "string"
                                  ? String((item.review as Record<string, unknown>).content)
                                  : undefined,
                          images: Array.isArray((item.review as Record<string, unknown>).images)
                              ? ((item.review as Record<string, unknown>).images as unknown[])
                                    .filter((img) => typeof img === "string")
                                    .map((img) => String(img))
                              : [],
                          createdAt:
                              typeof (item.review as Record<string, unknown>).createdAt === "string"
                                  ? String((item.review as Record<string, unknown>).createdAt)
                                  : undefined,
                      }
                    : undefined,
        };
    });

    return {
        id: String(raw.id ?? ""),
        orderNumber: String(raw.orderNumber ?? ""),
        status: String(raw.status ?? "pending").toLowerCase() as Order["status"],
        createdAt: String(raw.createdAt ?? new Date(0).toISOString()),
        updatedAt: String(raw.updatedAt ?? raw.createdAt ?? new Date(0).toISOString()),
        items,
        subtotal: num(raw.subtotal, 0),
        shipping: num(raw.shippingFee ?? raw.shipping, 0),
        discount: num(raw.discount, 0),
        total: num(raw.total, 0),
        shippingAddress: {
            fullName: String(raw.shippingName ?? ""),
            phone: String(raw.shippingPhone ?? ""),
            address: String(raw.shippingAddress ?? ""),
        },
        paymentMethod: normalizePaymentMethod(raw.paymentMethod),
        buyerName: String(
            (raw.buyer as { fullName?: string; username?: string } | undefined)?.fullName ??
                (raw.buyer as { username?: string } | undefined)?.username ??
                raw.shippingName ??
                "",
        ),
        sellerName: undefined,
        timeline: undefined,
        trackingNumber:
            typeof raw.trackingNumber === "string" ? raw.trackingNumber : undefined,
    };
}

/** Backend returns `{ data: Order[], pagination }` for my/purchases and my/sales. */
function unwrapOrderListPage(res: unknown): OrdersListResponse {
    if (typeof res !== "object" || res === null || !("data" in res)) {
        return { items: [], total: 0, page: 1, pageSize: 10 };
    }
    const r = res as {
        data: unknown;
        pagination?: { page: number; limit: number; total: number; totalPages: number };
    };
    const items = Array.isArray(r.data)
        ? (r.data as Record<string, unknown>[]).map(normalizeOrder)
        : [];
    const page = r.pagination?.page ?? 1;
    const pageSize = r.pagination?.limit ?? items.length;
    const total = r.pagination?.total ?? items.length;
    return { items, total, page, pageSize };
}

export const orderApi = {
    async listOrders(params: OrdersQueryParams = {}) {
        const query = new URLSearchParams();
        if (params.status && params.status !== "all") query.set("status", params.status.toUpperCase());
        query.set("page", String(params.page ?? 1));
        query.set("limit", String(params.pageSize ?? 10));
        const res = await httpClient.get<unknown>(
            `/orders/my/purchases?${query.toString()}`,
            { requiresAuth: true },
        );
        return unwrapOrderListPage(res);
    },
    async listSellerSales(params: OrdersQueryParams = {}) {
        const query = new URLSearchParams();
        if (params.status && params.status !== "all") query.set("status", params.status.toUpperCase());
        query.set("page", String(params.page ?? 1));
        query.set("limit", String(params.pageSize ?? 10));
        const res = await httpClient.get<unknown>(
            `/orders/my/sales?${query.toString()}`,
            { requiresAuth: true },
        );
        const page = unwrapOrderListPage(res);
        const q = params.q?.trim().toLowerCase();
        const fromTs = params.from ? new Date(params.from).getTime() : Number.NEGATIVE_INFINITY;
        const toTs = params.to ? new Date(params.to).getTime() : Number.POSITIVE_INFINITY;
        const filtered = page.items.filter((order) => {
            const createdTs = new Date(order.createdAt).getTime();
            const inDateRange = createdTs >= fromTs && createdTs <= toTs;
            const text = `${order.orderNumber} ${order.buyerName ?? ""}`.toLowerCase();
            const inSearch = !q || text.includes(q);
            return inDateRange && inSearch;
        });
        return { ...page, items: filtered, total: filtered.length };
    },
    async getOrder(orderId: string) {
        const res = await httpClient.get<ApiResponse<Order> | Order>(
            `/orders/${orderId}`,
            { requiresAuth: true },
        );
        const raw = unwrap<Record<string, unknown>>(res as ApiResponse<Record<string, unknown>> | Record<string, unknown>);
        return normalizeOrder(raw);
    },
    async createOrder(payload: CreateOrderPayload) {
        const res = await httpClient.post<ApiResponse<unknown> | unknown>(
            "/orders",
            payload,
            { requiresAuth: true },
        );
        const raw = unwrap<unknown>(res as ApiResponse<unknown> | unknown);
        if (Array.isArray(raw)) {
            return (raw as Record<string, unknown>[]).map(normalizeOrder);
        }
        if (typeof raw === "object" && raw !== null && "orders" in (raw as Record<string, unknown>)) {
            const orders = (raw as Record<string, unknown>).orders;
            return Array.isArray(orders)
                ? (orders as Record<string, unknown>[]).map(normalizeOrder)
                : [];
        }
        return normalizeOrder(raw as Record<string, unknown>);
    },
    async cancelOrder(orderId: string) {
        const res = await httpClient.post<ApiResponse<Order> | Order>(
            `/orders/${orderId}/cancel`,
            {},
            { requiresAuth: true },
        );
        return unwrap<Order>(res);
    },
    async updateOrderStatus(orderId: string, status: OrderStatus) {
        const res = await httpClient.put<ApiResponse<Record<string, unknown>> | Record<string, unknown>>(
            `/orders/${orderId}/status`,
            { status: status.toUpperCase() },
            { requiresAuth: true },
        );
        const raw = unwrap<Record<string, unknown>>(res as ApiResponse<Record<string, unknown>> | Record<string, unknown>);
        return normalizeOrder(raw);
    },
};
