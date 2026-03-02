import prisma from "../config/database.js";
import { getIO, isUserOnline } from "../config/socket.js";

class NotificationService {
    /**
     * Create a notification, save to DB, and push real-time if user is online
     */
    async create({
        userId,
        type,
        title,
        message,
        relatedUserId,
        relatedPostId,
        relatedProductId,
        relatedOrderId,
        actionUrl,
    }) {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                relatedUserId: relatedUserId || null,
                relatedPostId: relatedPostId || null,
                relatedProductId: relatedProductId || null,
                relatedOrderId: relatedOrderId || null,
                actionUrl: actionUrl || null,
            },
            include: {
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

        if (isUserOnline(userId)) {
            try {
                getIO()
                    .to(`user:${userId}`)
                    .emit("notification:new", notification);
            } catch {
                /* socket not critical */
            }
        }

        return notification;
    }

    /**
     * Get notifications for a user (paginated)
     */
    async getByUser(userId, { page = 1, limit = 20 } = {}) {
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userId },
                include: {
                    relatedUser: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where: { userId } }),
            prisma.notification.count({ where: { userId, isRead: false } }),
        ]);

        return { notifications, total, unreadCount, page, limit };
    }

    /**
     * Mark a single notification as read
     */
    async markAsRead(notificationId, userId) {
        return prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true, readAt: new Date() },
        });
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId) {
        return prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }

    /**
     * Delete a single notification
     */
    async delete(notificationId, userId) {
        return prisma.notification.deleteMany({
            where: { id: notificationId, userId },
        });
    }

    /**
     * Delete all notifications for a user
     */
    async deleteAll(userId) {
        return prisma.notification.deleteMany({
            where: { userId },
        });
    }

    // ─── Convenience methods for specific notification types ──────

    async notifyLike(post, likerUser) {
        if (post.authorId === likerUser.id) return;
        return this.create({
            userId: post.authorId,
            type: "post_like",
            title: "Lượt thích mới",
            message: `${likerUser.fullName || likerUser.username} đã thích bài viết của bạn`,
            relatedUserId: likerUser.id,
            relatedPostId: post.id,
            actionUrl: `/post/${post.id}`,
        });
    }

    async notifyComment(post, commenterUser) {
        if (post.authorId === commenterUser.id) return;
        return this.create({
            userId: post.authorId,
            type: "post_comment",
            title: "Bình luận mới",
            message: `${commenterUser.fullName || commenterUser.username} đã bình luận bài viết của bạn`,
            relatedUserId: commenterUser.id,
            relatedPostId: post.id,
            actionUrl: `/post/${post.id}`,
        });
    }

    async notifyFollow(targetUserId, followerUser) {
        return this.create({
            userId: targetUserId,
            type: "new_follower",
            title: "Người theo dõi mới",
            message: `${followerUser.fullName || followerUser.username} đã theo dõi bạn`,
            relatedUserId: followerUser.id,
            actionUrl: `/profile/${followerUser.username}`,
        });
    }

    async notifyNewOrder(order, sellerId) {
        return this.create({
            userId: sellerId,
            type: "new_order",
            title: "Đơn hàng mới",
            message: `Bạn có đơn hàng mới #${order.orderNumber}`,
            relatedOrderId: order.id,
            actionUrl: `/seller/orders`,
        });
    }

    async notifyOrderStatusChange(order, buyerId, newStatus) {
        const statusLabels = {
            CONFIRMED: "đã được xác nhận",
            PROCESSING: "đang được xử lý",
            SHIPPING: "đang được giao",
            DELIVERED: "đã giao thành công",
            CANCELLED: "đã bị hủy",
            REFUNDED: "đã được hoàn tiền",
        };
        return this.create({
            userId: buyerId,
            type: "order_status",
            title: "Cập nhật đơn hàng",
            message: `Đơn hàng #${order.orderNumber} ${statusLabels[newStatus] || newStatus}`,
            relatedOrderId: order.id,
            actionUrl: `/orders/${order.id}`,
        });
    }

    async notifyNewMessage(conversationId, senderUser, receiverUserId) {
        return this.create({
            userId: receiverUserId,
            type: "new_message",
            title: "Tin nhắn mới",
            message: `${senderUser.fullName || senderUser.username} đã gửi tin nhắn cho bạn`,
            relatedUserId: senderUser.id,
            actionUrl: `/messages`,
        });
    }
}

export default new NotificationService();
