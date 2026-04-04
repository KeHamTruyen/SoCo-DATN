export interface Conversation {
    id: string;
    participantId: string;
    participantName: string;
    participantAvatarUrl?: string;
    isOnline: boolean;
    lastMessage?: string;
    /** True if the latest message in the thread was sent by the current user */
    lastMessageIsOwn?: boolean;
    lastMessageAt?: string;
    unreadCount: number;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    type: "text" | "product" | "image";
    /** Set when type is "image" (messageType IMAGE + mediaUrl from API) */
    mediaUrl?: string;
    product?: {
        id: string;
        name: string;
        price: number;
        imageUrl?: string;
        description?: string;
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ConversationsListResponse {
    items: Conversation[];
    pagination?: PaginationMeta;
}

export interface MessagesListResponse {
    items: Message[];
    pagination?: PaginationMeta;
}
