import { httpClient } from "../../../shared/api/httpClient";
import type { Notification, NotificationsListResponse } from "../types/notification.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

export const notificationApi = {
    async listNotifications(type?: "all" | "social" | "order" | "system") {
        const query = type && type !== "all" ? `?type=${type}` : "";
        const res = await httpClient.get<
            ApiResponse<NotificationsListResponse> | NotificationsListResponse
        >(`/notifications${query}`, { requiresAuth: true });
        return unwrap<NotificationsListResponse>(res);
    },
    async markAllRead() {
        return httpClient.patch("/notifications/read-all", {}, { requiresAuth: true });
    },
    async markRead(notificationId: string) {
        const res = await httpClient.patch<ApiResponse<Notification> | Notification>(
            `/notifications/${notificationId}/read`,
            {},
            { requiresAuth: true },
        );
        return unwrap<Notification>(res);
    },
};
