import express from 'express';
import aiController from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate-text', aiController.generateText);
router.post('/generate-image-text', aiController.generateImageText);
router.post('/generate-video-images-text', aiController.generateVideoImagesText);

export default router;
