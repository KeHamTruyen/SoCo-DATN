import api from './api';

export interface User {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string | null;
  attachmentUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  sender?: User;
}

export interface ConversationParticipant {
  userId: string;
  user: User;
  joinedAt: string;
}

export interface Conversation {
  id: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages?: Message[];
  unreadCount?: number;
  _count?: {
    messages: number;
  };
  // Computed properties for convenience
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SendMessageData {
  content: string;
  mediaUrl?: string;
  attachmentUrl?: string;
}

class MessageService {
  /**
   * Get or create conversation with another user
   */
  async getOrCreateConversation(recipientId: string) {
    const response = await api.post('/messages/conversations', { recipientId });
    return response.data;
  }

  /**
   * Get all conversations for current user
   */
  async getUserConversations(page = 1, limit = 20) {
    const response = await api.get('/messages/conversations', {
      params: { page, limit }
    });
    
    // Transform conversations to add lastMessage and lastMessageAt
    const conversations = response.data.data.conversations.map((conv: any) => ({
      ...conv,
      lastMessage: conv.messages?.[0]?.content || '',
      lastMessageAt: conv.messages?.[0]?.createdAt || conv.updatedAt
    }));
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        conversations
      }
    };
  }

  /**
   * Get messages in a conversation
   */
  async getConversationMessages(
    conversationId: string,
    page = 1,
    limit = 50
  ) {
    const response = await api.get(`/messages/conversations/${conversationId}`, {
      params: { page, limit }
    });
    return response.data.data; // Return the data object directly which contains messages array
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId: string, data: SendMessageData): Promise<Message> {
    const response = await api.post(
      `/messages/conversations/${conversationId}/messages`,
      data
    );
    return response.data.data.message; // Return the message directly
  }

  /**
   * Mark all messages as read in a conversation
   */
  async markMessagesAsRead(conversationId: string) {
    const response = await api.put(`/messages/conversations/${conversationId}/read`);
    return response.data;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string) {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  }

  /**
   * Get unread message count
   */
  async getUnreadCount() {
    const response = await api.get('/messages/unread/count');
    return response.data;
  }

  /**
   * Search conversations by username
   */
  async searchConversations(searchQuery: string) {
    const response = await api.get('/messages/conversations/search', {
      params: { q: searchQuery }
    });
    return response.data;
  }
}

export default new MessageService();
