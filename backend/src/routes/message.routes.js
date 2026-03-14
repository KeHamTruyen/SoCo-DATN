import express from 'express';
import messageController from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadMessage } from '../config/cloudinary.js';
import {
  createConversationValidator,
  sendMessageValidator,
  conversationIdValidator,
  messageIdValidator,
  paginationValidator,
  searchQueryValidator
} from '../validators/message.validator.js';

const router = express.Router();

/**
 * @swagger
 * /api/messages/unread/count:
 *   get:
 *     tags: [Messages]
 *     summary: Get unread message count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/unread/count', protect, messageController.getUnreadCount);

/**
 * @swagger
 * /api/messages/conversations/search:
 *   get:
 *     tags: [Messages]
 *     summary: Search conversations by username
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Conversations found
 *       400:
 *         description: Invalid search query
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations/search', protect, searchQueryValidator, messageController.searchConversations);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Get all conversations for current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Messages]
 *     summary: Get or create conversation with another user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: User ID of the recipient
 *     responses:
 *       200:
 *         description: Conversation retrieved or created
 *       400:
 *         description: Invalid recipient ID
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations', protect, paginationValidator, messageController.getUserConversations);
router.post('/conversations', protect, createConversationValidator, messageController.getOrCreateConversation);

/**
 * @swagger
 * /api/messages/conversations/{conversationId}:
 *   get:
 *     tags: [Messages]
 *     summary: Get messages in a conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       403:
 *         description: Not a participant of this conversation
 *       404:
 *         description: Conversation not found
 */
router.get('/conversations/:conversationId', protect, conversationIdValidator, paginationValidator, messageController.getConversationMessages);

/**
 * @swagger
 * /api/messages/conversations/{conversationId}/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message in a conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *                 description: Message content
 *               attachmentUrl:
 *                 type: string
 *                 format: uri
 *                 description: Optional attachment URL
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid message content
 *       403:
 *         description: Not a participant of this conversation
 */
router.post('/conversations/:conversationId/messages', protect, sendMessageValidator, messageController.sendMessage);
router.post('/conversations/:conversationId/attachments', protect, conversationIdValidator, uploadMessage.single('file'), messageController.uploadAttachment);

/**
 * @swagger
 * /api/messages/conversations/{conversationId}/read:
 *   put:
 *     tags: [Messages]
 *     summary: Mark all messages as read in a conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       403:
 *         description: Not a participant of this conversation
 */
router.put('/conversations/:conversationId/read', protect, conversationIdValidator, messageController.markAsRead);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a message (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       403:
 *         description: Can only delete your own messages
 *       404:
 *         description: Message not found
 */
router.delete('/:messageId', protect, messageIdValidator, messageController.deleteMessage);

export default router;
