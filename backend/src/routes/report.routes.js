import { Router } from 'express';
import reportController from '../controllers/report.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

// User routes
router.post('/', reportController.createReport);
router.get('/me', reportController.getMyReports);

export default router;
