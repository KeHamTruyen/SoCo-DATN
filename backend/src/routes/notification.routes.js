import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import { protect, restrictToMember } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictToMember);

router.get('/', notificationController.getNotifications);
router.get('/preferences', notificationController.getPreferences);
// Support both PATCH and PUT for backward compatibility with existing clients/docs.
router.patch('/preferences', notificationController.updatePreferences);
router.put('/read-all', notificationController.markAllAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/', notificationController.deleteAll);

export default router;
