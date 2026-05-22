import prisma from "../config/database.js";
import { getIO, isUserOnline } from "../config/socket.js";

const SOCIAL_TYPES = new Set(["post_like", "post_comment", "new_follower"]);
const ORDER_TYPES = new Set(["new_order", "order_status"]);

function toCategory(type) {
    if (ORDER_TYPES.has(type)) return "order";
    if (SOCIAL_TYPES.has(type)) return "social";
    return "system";
}

function toObject(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }
    return {};
}

class NotificationService {
    toRealtimePayload(notification) {
        return {
            event: "notification:new",
            schemaVersion: 1,
            id: notification.id,
            userId: notification.userId,
            rawType: notification.type,
            category: toCategory(notification.type),
            title: notification.title,
            message: notification.message,
            isRead: notification.isRead,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            actionUrl: notification.actionUrl,
            related: {
                userId: notification.relatedUserId,
                postId: notification.relatedPostId,
                productId: notification.relatedProductId,
                orderId: notification.relatedOrderId,
            },
            actor: notification.relatedUser
                ? {
                      id: notification.relatedUser.id,
                      username: notification.relatedUser.username,
                      fullName: notification.relatedUser.fullName,
                      avatarUrl: notification.relatedUser.avatarUrl,
                  }
                : null,
        };
    }

    async getPreferences(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { privacySettings: true },
        });
        const preferences = user?.privacySettings?.notificationPreferences;
        return {
            social: preferences?.social ?? true,
            order: preferences?.order ?? true,
            system: preferences?.system ?? true,
        };
    }

    async updatePreferences(userId, updates = {}) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { privacySettings: true },
        });
        const privacySettings = toObject(user?.privacySettings);
        const currentPreferences = toObject(privacySettings.notificationPreferences);
        const current = {
            social: currentPreferences.social ?? true,
            order: currentPreferences.order ?? true,
            system: currentPreferences.system ?? true,
        };
        const nextPreferences = {
            social:
                typeof updates.social === "boolean"
                    ? updates.social
                    : current.social,
            order:
                typeof updates.order === "boolean" ? updates.order : current.order,
            system:
                typeof updates.system === "boolean"
                    ? updates.system
                    : current.system,
        };

        await prisma.user.update({
            where: { id: userId },
            data: {
                privacySettings: {
                    ...privacySettings,
                    notificationPreferences: nextPreferences,
                },
            },
        });
        return nextPreferences;
    }

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
        const category = toCategory(type);
        const preferences = await this.getPreferences(userId);
        if (!preferences[category]) {
            return null;
        }

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
                    .emit("notification:new", this.toRealtimePayload(notification));
            } catch {
                /* socket not critical */
            }
        }

        return notification;
    }

    /**
     * Get notifications for a user (paginated)
     */
    async getByUser(userId, { page = 1, limit = 20, type = "all" } = {}) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (type === "social") {
            where.type = { in: Array.from(SOCIAL_TYPES) };
        } else if (type === "order") {
            where.type = { in: Array.from(ORDER_TYPES) };
        } else if (type === "system") {
            where.type = { notIn: [...Array.from(SOCIAL_TYPES), ...Array.from(ORDER_TYPES)] };
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
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { ...where, isRead: false } }),
        ]);

        return { notifications, total, unreadCount, page, limit };
    }

    /**
     * Mark a single notification as read
     */
    async markAsRead(notificationId, userId) {
        const result = await prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true, readAt: new Date() },
        });
        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false },
        });
        if (result.count > 0 && isUserOnline(userId)) {
            try {
                getIO().to(`user:${userId}`).emit("notification:read", {
                    id: notificationId,
                    unreadCount,
                });
            } catch {
                /* socket not critical */
            }
        }
        return result;
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId) {
        const result = await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        if (result.count > 0 && isUserOnline(userId)) {
            try {
                getIO().to(`user:${userId}`).emit("notification:read-all", {
                    unreadCount: 0,
                });
            } catch {
                /* socket not critical */
            }
        }
        return result;
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
            actionUrl: `/profile/${followerUser.id}`,
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
