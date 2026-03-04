import api from './api';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MessageParticipantUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  user: MessageParticipantUser;
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  participants: ConversationParticipant[];
  updatedAt: string;
  lastMessage: MessageItem | null;
  unreadCount: number;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM';
  mediaUrl: string | null;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  sender: MessageParticipantUser;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

const messageService = {
  getOrCreateConversation: async (userId: string): Promise<ApiResponse<Conversation>> => {
    const response = await api.post<ApiResponse<Conversation>>('/messages/conversations', { userId });
    return response.data;
  },

  getConversations: async (page = 1, limit = 20): Promise<PaginatedResponse<Conversation>> => {
    const response = await api.get<PaginatedResponse<Conversation>>(
      `/messages/conversations?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getMessages: async (
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<MessageItem>> => {
    const response = await api.get<PaginatedResponse<MessageItem>>(
      `/messages/conversations/${conversationId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    content: string
  ): Promise<ApiResponse<MessageItem>> => {
    const response = await api.post<ApiResponse<MessageItem>>(
      `/messages/conversations/${conversationId}`,
      { content, messageType: 'TEXT' }
    );
    return response.data;
  },

  markRead: async (conversationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch<{ success: boolean; message: string }>(
      `/messages/conversations/${conversationId}/read`
    );
    return response.data;
  },
};

export default messageService;
