import messageService from '../services/message.service.js';

class MessageController {
  async getOrCreateConversation(req, res, next) {
    try {
      const conversation = await messageService.getOrCreateDirectConversation(
        req.user.id,
        req.body.userId,
      );
      res.json({ success: true, data: conversation });
    } catch (error) {
      if (error.message === 'Cannot message yourself') {
        return res.status(400).json({ success: false, message: error.message });
      }
      if (error.message === 'User not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const message = await messageService.sendMessage(
        req.params.conversationId,
        req.user.id,
        req.body,
      );
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      if (error.message === 'Not a participant') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async getConversations(req, res, next) {
    try {
      const result = await messageService.getConversations(req.user.id, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      });
      res.json({
        success: true,
        data: result.conversations,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const result = await messageService.getMessages(
        req.params.conversationId,
        req.user.id,
        {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 50,
        },
      );
      res.json({
        success: true,
        data: result.messages,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.message === 'Not a participant') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async markRead(req, res, next) {
    try {
      await messageService.markConversationRead(req.params.conversationId, req.user.id);
      res.json({ success: true, message: 'Conversation marked as read' });
    } catch (error) {
      if (error.message === 'Not a participant') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      await messageService.deleteMessage(req.params.messageId, req.user.id);
      res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
      if (error.message === 'Message not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}

export default new MessageController();
