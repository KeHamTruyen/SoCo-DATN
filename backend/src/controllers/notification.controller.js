import notificationService from "../services/notification.service.js";

class NotificationController {
    /**
     * GET /api/notifications
     */
    async getNotifications(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const data = await notificationService.getByUser(req.user.id, {
                page,
                limit,
            });

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/notifications/:id/read
     */
    async markAsRead(req, res, next) {
        try {
            await notificationService.markAsRead(req.params.id, req.user.id);
            res.json({ success: true, message: "Notification marked as read" });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/notifications/read-all
     */
    async markAllAsRead(req, res, next) {
        try {
            await notificationService.markAllAsRead(req.user.id);
            res.json({
                success: true,
                message: "All notifications marked as read",
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/notifications/:id
     */
    async deleteNotification(req, res, next) {
        try {
            await notificationService.delete(req.params.id, req.user.id);
            res.json({ success: true, message: "Notification deleted" });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/notifications
     */
    async deleteAll(req, res, next) {
        try {
            await notificationService.deleteAll(req.user.id);
            res.json({ success: true, message: "All notifications deleted" });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();
