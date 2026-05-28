export type NotificationType = "social" | "order" | "system";
export type NotificationIconType =
    | "comment"
    | "like"
    | "follow"
    | "order"
    | "message"
    | "system";

export interface Notification {
    id: string;
    type: NotificationType;
    title?: string;
    content: string;
    actorName?: string;
    actorAvatarUrl?: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
    iconType?: NotificationIconType;
}

export interface NotificationsListResponse {
    items: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
}

export interface NotificationPreferences {
    social: boolean;
    order: boolean;
    system: boolean;
}
