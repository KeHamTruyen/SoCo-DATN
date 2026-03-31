import { httpClient } from "../../../shared/api/httpClient";
import type {
    Notification,
    NotificationPreferences,
    NotificationsListResponse,
} from "../types/notification.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

interface BackendNotification {
    id: string;
    type?: string;
    rawType?: string;
    category?: Notification["type"];
    title?: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string | null;
    userId?: string;
    actionUrl?: string | null;
    relatedUser?: {
        fullName?: string | null;
        username?: string | null;
        avatarUrl?: string | null;
    } | null;
    actor?: {
        fullName?: string | null;
        username?: string | null;
        avatarUrl?: string | null;
    } | null;
}

interface BackendNotificationsListResponse {
    notifications: BackendNotification[];
    total: number;
    unreadCount: number;
}

function mapType(rawType: string): Notification["type"] {
    if (rawType.includes("order")) return "order";
    if (rawType.startsWith("post_") || rawType === "new_follower") return "social";
    if (rawType === "new_message") return "system";
    return "system";
}

function mapIconType(rawType: string): Notification["iconType"] {
    switch (rawType) {
        case "post_comment":
            return "comment";
        case "post_like":
            return "like";
        case "new_follower":
            return "follow";
        case "new_order":
        case "order_status":
            return "order";
        case "new_message":
            return "message";
        default:
            return "system";
    }
}

function toNotification(raw: BackendNotification): Notification {
    const actor = raw.actor || raw.relatedUser;
    const rawType = raw.rawType || raw.type || "system";
    const category = raw.category || mapType(rawType);
    const actorName = actor?.fullName || actor?.username || undefined;
    return {
        id: raw.id,
        type: category,
        title: raw.title,
        content: raw.message,
        actorName,
        actorAvatarUrl: actor?.avatarUrl || undefined,
        isRead: raw.isRead,
        createdAt: raw.createdAt,
        link: raw.actionUrl || undefined,
        iconType: mapIconType(rawType),
    };
}

function normalizeListResponse(
    res: ApiResponse<BackendNotificationsListResponse> | BackendNotificationsListResponse,
): NotificationsListResponse {
    const data = unwrap<BackendNotificationsListResponse>(res);
    return {
        items: data.notifications.map(toNotification),
        total: data.total,
        unreadCount: data.unreadCount,
    };
}

export const notificationApi = {
    async listNotifications(type?: "all" | "social" | "order" | "system") {
        const query = type && type !== "all" ? `?type=${type}` : "";
        const res = await httpClient.get<
            ApiResponse<BackendNotificationsListResponse> | BackendNotificationsListResponse
        >(`/notifications${query}`, { requiresAuth: true });
        return normalizeListResponse(res);
    },
    async markAllRead() {
        return httpClient.patch("/notifications/read-all", {}, { requiresAuth: true });
    },
    async markRead(notificationId: string) {
        const res = await httpClient.patch<ApiResponse<unknown> | unknown>(
            `/notifications/${notificationId}/read`,
            {},
            { requiresAuth: true },
        );
        return unwrap<unknown>(res);
    },
    mapRealtimeNotification(raw: unknown) {
        return toNotification(raw as BackendNotification);
    },
    async getPreferences() {
        const res = await httpClient.get<ApiResponse<NotificationPreferences> | NotificationPreferences>(
            "/notifications/preferences",
            { requiresAuth: true },
        );
        return unwrap<NotificationPreferences>(res);
    },
    async updatePreferences(updates: Partial<NotificationPreferences>) {
        const res = await httpClient.patch<
            ApiResponse<NotificationPreferences> | NotificationPreferences
        >("/notifications/preferences", updates, { requiresAuth: true });
        return unwrap<NotificationPreferences>(res);
    },
};
