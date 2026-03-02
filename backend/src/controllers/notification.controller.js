import notificationService from '../services/notification.service.js';

class NotificationController {
  /**
   * Get user notifications
   * GET /api/notifications
   * Query: page, limit, isRead
   */
  async getUserNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : null;

      const result = await notificationService.getUserNotifications(userId, page, limit, isRead);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification by ID
   * GET /api/notifications/:id
   */
  async getNotificationById(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const notification = await notificationService.getNotificationById(id, userId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.json({
        success: true,
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   * PATCH /api/notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const updated = await notificationService.markAsRead(id, userId);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found or already read',
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: `${result.count} notifications marked as read`,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const deleted = await notificationService.deleteNotification(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread count
   * GET /api/notifications/unread/count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;

      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete old read notifications
   * DELETE /api/notifications/cleanup
   */
  async deleteOldNotifications(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await notificationService.deleteOldNotifications(userId);

      res.json({
        success: true,
        message: `${result.count} old notifications deleted`,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
