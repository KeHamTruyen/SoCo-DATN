import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createScheduledPost,
  deleteScheduledPost,
  getMyScheduledPosts,
  publishScheduledPostNow
} from '../controllers/scheduled-post.controller.js';
import {
  createScheduledPostValidation,
  listScheduledPostsValidation,
  scheduledPostIdValidation,
  validate
} from '../validators/scheduled-post.validator.js';

const router = Router();

router.use(protect);

router.get('/me', listScheduledPostsValidation, validate, getMyScheduledPosts);
router.post('/', createScheduledPostValidation, validate, createScheduledPost);
router.post('/:id/publish-now', scheduledPostIdValidation, validate, publishScheduledPostNow);
router.delete('/:id', scheduledPostIdValidation, validate, deleteScheduledPost);

export default router;
