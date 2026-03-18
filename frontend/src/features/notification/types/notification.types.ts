export type NotificationType = "social" | "order" | "system";

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
    iconType?: "comment" | "like" | "follow" | "order" | "system";
}

export interface NotificationsListResponse {
    items: Notification[];
    total: number;
    unreadCount: number;
}
