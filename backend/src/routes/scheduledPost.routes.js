import express from 'express';
import scheduledPostController from '../controllers/scheduledPost.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', scheduledPostController.create);
router.get('/', scheduledPostController.getAll);
router.get('/analytics', scheduledPostController.getAnalytics);
router.put('/:id', scheduledPostController.update);
router.post('/:id/publish', scheduledPostController.publishNow);
router.delete('/:id', scheduledPostController.delete);

export default router;
