import { httpClient } from "../../../shared/api/httpClient";
import type {
    CreateOrderPayload,
    Order,
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

/** Backend returns `{ data: Order[], pagination }` for my/purchases and my/sales. */
function unwrapOrderListPage(res: unknown): OrdersListResponse {
    if (typeof res !== "object" || res === null || !("data" in res)) {
        return { items: [], total: 0, page: 1, pageSize: 10 };
    }
    const r = res as {
        data: unknown;
        pagination?: { page: number; limit: number; total: number; totalPages: number };
    };
    const items = Array.isArray(r.data) ? (r.data as Order[]) : [];
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
        return unwrapOrderListPage(res);
    },
    async getOrder(orderId: string) {
        const res = await httpClient.get<ApiResponse<Order> | Order>(
            `/orders/${orderId}`,
            { requiresAuth: true },
        );
        return unwrap<Order>(res);
    },
    async createOrder(payload: CreateOrderPayload) {
        const res = await httpClient.post<ApiResponse<Order> | Order>(
            "/orders",
            payload,
            { requiresAuth: true },
        );
        return unwrap<Order>(res);
    },
    async cancelOrder(orderId: string) {
        const res = await httpClient.post<ApiResponse<Order> | Order>(
            `/orders/${orderId}/cancel`,
            {},
            { requiresAuth: true },
        );
        return unwrap<Order>(res);
    },
};
