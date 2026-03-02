import { Router } from 'express';
import messageController from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

// Create or get existing direct conversation
router.post('/conversations', messageController.getOrCreateConversation);

// List my conversations
router.get('/conversations', messageController.getConversations);

// Get messages in a conversation
router.get('/conversations/:conversationId', messageController.getMessages);

// Send message to a conversation
router.post('/conversations/:conversationId', messageController.sendMessage);

// Mark conversation as read
router.patch('/conversations/:conversationId/read', messageController.markRead);

// Delete (soft) a single message
router.delete('/messages/:messageId', messageController.deleteMessage);

export default router;
