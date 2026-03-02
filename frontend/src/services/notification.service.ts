import api from './api';

export interface User {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  isVerified?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedUserId: string | null;
  relatedProductId: string | null;
  relatedOrderId: string | null;
  relatedPostId: string | null;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  relatedUser?: User;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    unreadCount: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

class NotificationService {
  /**
   * Get user notifications
   */
  async getUserNotifications(page = 1, limit = 20, isRead?: boolean) {
    const params: any = { page, limit };
    if (isRead !== undefined) {
      params.isRead = isRead;
    }

    const response = await api.get<NotificationsResponse>('/notifications', { params });
    return response.data;
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId: string) {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const response = await api.get<UnreadCountResponse>('/notifications/unread/count');
    return response.data;
  }

  /**
   * Delete old read notifications
   */
  async deleteOldNotifications() {
    const response = await api.delete('/notifications/cleanup');
    return response.data;
  }
}

export default new NotificationService();
