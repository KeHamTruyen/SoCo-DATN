import notificationService from "../services/notification.service.js";

class NotificationController {
    /**
     * GET /api/notifications
     */
    async getNotifications(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const type = req.query.type || "all";

            const data = await notificationService.getByUser(req.user.id, {
                page,
                limit,
                type,
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
     * GET /api/notifications/preferences
     */
    async getPreferences(req, res, next) {
        try {
            const data = await notificationService.getPreferences(req.user.id);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/notifications/preferences
     */
    async updatePreferences(req, res, next) {
        try {
            const data = await notificationService.updatePreferences(
                req.user.id,
                req.body || {},
            );
            res.json({ success: true, data });
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
