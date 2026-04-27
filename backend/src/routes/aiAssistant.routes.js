import express from 'express';
import aiAssistantController from '../controllers/aiAssistant.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/chat', aiAssistantController.chat);

export default router;
