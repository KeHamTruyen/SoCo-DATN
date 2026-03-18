export interface Conversation {
    id: string;
    participantId: string;
    participantName: string;
    participantAvatarUrl?: string;
    isOnline: boolean;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    type: "text" | "product";
    product?: {
        id: string;
        name: string;
        price: number;
        imageUrl?: string;
        description?: string;
    };
}

export interface ConversationsListResponse {
    items: Conversation[];
}

export interface MessagesListResponse {
    items: Message[];
    nextCursor: string | null;
}
