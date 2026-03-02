import { Router } from 'express';
import reportController from '../controllers/report.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

// User routes
router.post('/', reportController.createReport);
router.get('/me', reportController.getMyReports);

// Admin routes
router.get('/', restrictTo('ADMIN'), reportController.getReports);
router.get('/:reportId', restrictTo('ADMIN'), reportController.getReportById);
router.patch('/:reportId/resolve', restrictTo('ADMIN'), reportController.resolveReport);

export default router;
