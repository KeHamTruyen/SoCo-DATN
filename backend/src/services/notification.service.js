import prisma from '../config/database.js';
import { sendNotificationToUser } from '../config/socket.js';

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification({
    userId,
    type,
    title,
    message,
    relatedUserId = null,
    relatedProductId = null,
    relatedOrderId = null,
    relatedPostId = null,
    actionUrl = null,
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedUserId,
        relatedProductId,
        relatedOrderId,
        relatedPostId,
        actionUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Send real-time notification via Socket.IO
    try {
      sendNotificationToUser(userId, notification);
    } catch (error) {
      console.error('Failed to send real-time notification:', error);
      // Don't throw error - notification is still saved in DB
    }

    return notification;
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId, page = 1, limit = 20, isRead = null) {
    const skip = (page - 1) * limit;

    const where = { userId };
    if (isRead !== null) {
      where.isRead = isRead;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          relatedUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId, userId) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
      include: {
        relatedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
    });

    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return notification.count > 0;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const result = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    return result.count > 0;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Delete old read notifications (older than 30 days)
   */
  async deleteOldNotifications(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
        readAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return result;
  }

  // ========================================
  // HELPER METHODS TO CREATE SPECIFIC NOTIFICATIONS
  // ========================================

  /**
   * Create notification for new like
   */
  async notifyPostLike(postId, postAuthorId, likerId) {
    if (postAuthorId === likerId) return; // Don't notify self

    const [liker, post] = await Promise.all([
      prisma.user.findUnique({
        where: { id: likerId },
        select: { fullName: true },
      }),
      prisma.post.findUnique({
        where: { id: postId },
        select: { content: true },
      }),
    ]);

    const contentPreview = post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '');

    return this.createNotification({
      userId: postAuthorId,
      type: 'like',
      title: 'Bài viết mới nhận lượt thích',
      message: `${liker.fullName} đã thích bài viết của bạn: "${contentPreview}"`,
      relatedUserId: likerId,
      relatedPostId: postId,
      actionUrl: `/post/${postId}`,
    });
  }

  /**
   * Create notification for new comment
   */
  async notifyPostComment(postId, postAuthorId, commenterId, commentContent) {
    if (postAuthorId === commenterId) return; // Don't notify self

    const commenter = await prisma.user.findUnique({
      where: { id: commenterId },
      select: { fullName: true },
    });

    const commentPreview = commentContent.substring(0, 50) + (commentContent.length > 50 ? '...' : '');

    return this.createNotification({
      userId: postAuthorId,
      type: 'comment',
      title: 'Bình luận mới',
      message: `${commenter.fullName} đã bình luận: "${commentPreview}"`,
      relatedUserId: commenterId,
      relatedPostId: postId,
      actionUrl: `/post/${postId}`,
    });
  }

  /**
   * Create notification for new follower
   */
  async notifyNewFollower(followedUserId, followerId) {
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { fullName: true, username: true },
    });

    return this.createNotification({
      userId: followedUserId,
      type: 'FOLLOW',
      title: 'Người theo dõi mới',
      message: `${follower.fullName} (@${follower.username}) đã bắt đầu theo dõi bạn`,
      relatedUserId: followerId,
      actionUrl: `/profile/${follower.username}`,
    });
  }

  /**
   * Create notification for order status change
   */
  async notifyOrderStatusChange(orderId, buyerId, newStatus) {
    const statusMessages = {
      CONFIRMED: 'Đơn hàng đã được xác nhận',
      PROCESSING: 'Đơn hàng đang được xử lý',
      SHIPPING: 'Đơn hàng đang được giao',
      DELIVERED: 'Đơn hàng đã được giao',
      COMPLETED: 'Đơn hàng hoàn thành',
      CANCELLED: 'Đơn hàng đã bị hủy',
      REFUNDED: 'Đơn hàng đã được hoàn tiền',
    };

    const message = statusMessages[newStatus] || `Trạng thái đơn hàng: ${newStatus}`;

    return this.createNotification({
      userId: buyerId,
      type: 'ORDER',
      title: 'Cập nhật đơn hàng',
      message: message,
      relatedOrderId: orderId,
      actionUrl: `/orders/${orderId}`,
    });
  }

  /**
   * Create notification for new message
   */
  async notifyNewMessage(recipientId, senderId, conversationId) {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { fullName: true },
    });

    return this.createNotification({
      userId: recipientId,
      type: 'MESSAGE',
      title: 'Tin nhắn mới',
      message: `${sender.fullName} đã gửi tin nhắn cho bạn`,
      relatedUserId: senderId,
      actionUrl: `/messages?conversation=${conversationId}`,
    });
  }

  /**
   * Create notification for product mention in post
   */
  async notifyProductMention(productId, sellerId, postAuthorId, postId) {
    if (sellerId === postAuthorId) return; // Don't notify self

    const [author, product] = await Promise.all([
      prisma.user.findUnique({
        where: { id: postAuthorId },
        select: { fullName: true },
      }),
      prisma.product.findUnique({
        where: { id: productId },
        select: { title: true },
      }),
    ]);

    return this.createNotification({
      userId: sellerId,
      type: 'PRODUCT_TAG',
      title: 'Sản phẩm được gắn thẻ',
      message: `${author.fullName} đã gắn thẻ sản phẩm "${product.title}" trong bài viết`,
      relatedUserId: postAuthorId,
      relatedProductId: productId,
      relatedPostId: postId,
      actionUrl: `/posts/${postId}`,
    });
  }
}

export default new NotificationService();
