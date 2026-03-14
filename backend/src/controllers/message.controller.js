import messageService from '../services/message.service.js';
import { emitToConversation } from '../config/socket.js';

class MessageController {
  /**
   * Get or create conversation between two users
   * POST /api/messages/conversations
   * Body: { recipientId: string }
   */
  async getOrCreateConversation(req, res, next) {
    try {
      const { recipientId } = req.body;
      const userId = req.user.id;

      if (!recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Recipient ID is required'
        });
      }

      if (recipientId === userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create conversation with yourself'
        });
      }

      const conversation = await messageService.getOrCreateConversation(userId, recipientId);

      res.json({
        success: true,
        data: { conversation }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all conversations for current user
   * GET /api/messages/conversations
   * Query: page, limit
   */
  async getUserConversations(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await messageService.getUserConversations(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get messages in a conversation
   * GET /api/messages/conversations/:conversationId
   * Query: page, limit
   */
  async getConversationMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await messageService.getConversationMessages(
        conversationId,
        userId,
        page,
        limit
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send a message in a conversation
   * POST /api/messages/conversations/:conversationId/messages
   * Body: { content: string, attachmentUrl?: string }
   */
  async sendMessage(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { content, mediaUrl, attachmentUrl } = req.body;
      const userId = req.user.id;
      const resolvedMediaUrl = mediaUrl ?? attachmentUrl ?? null;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
      }

      const message = await messageService.sendMessage(
        conversationId,
        userId,
        content.trim(),
        resolvedMediaUrl
      );

      // Emit Socket.IO event for real-time delivery
      try {
        emitToConversation(conversationId, 'message:new', {
          conversationId,
          message
        });
      } catch (socketError) {
        console.error('Socket.IO emit error:', socketError);
        // Continue even if Socket.IO fails
      }

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { message }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark messages as read in a conversation
   * PUT /api/messages/conversations/:conversationId/read
   */
  async markAsRead(req, res, next) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      const count = await messageService.markMessagesAsRead(conversationId, userId);

      res.json({
        success: true,
        message: `${count} message(s) marked as read`,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a message
   * DELETE /api/messages/:messageId
   */
  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const message = await messageService.deleteMessage(messageId, userId);

      res.json({
        success: true,
        message: 'Message deleted successfully',
        data: { message }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread message count
   * GET /api/messages/unread/count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const count = await messageService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search conversations
   * GET /api/messages/conversations/search
   * Query: q (search query)
   */
  async searchConversations(req, res, next) {
    try {
      const userId = req.user.id;
      const searchQuery = req.query.q || '';

      if (searchQuery.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const conversations = await messageService.searchConversations(userId, searchQuery);

      res.json({
        success: true,
        data: { conversations }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
