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

export const orderApi = {
    async listOrders(params: OrdersQueryParams = {}) {
        const query = new URLSearchParams();
        if (params.status && params.status !== "all") query.set("status", params.status.toUpperCase());
        query.set("page", String(params.page ?? 1));
        query.set("limit", String(params.pageSize ?? 10));
        const res = await httpClient.get<ApiResponse<OrdersListResponse> | OrdersListResponse>(
            `/orders/my/purchases?${query.toString()}`,
            { requiresAuth: true },
        );
        return unwrap<OrdersListResponse>(res);
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
