import { httpClient } from "../../../shared/api/httpClient";
import type {
    ConversationsListResponse,
    Message,
    MessagesListResponse,
} from "../types/messaging.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

export const messagingApi = {
    async listConversations() {
        const res = await httpClient.get<
            ApiResponse<ConversationsListResponse> | ConversationsListResponse
        >("/conversations", { requiresAuth: true });
        return unwrap<ConversationsListResponse>(res);
    },
    async listMessages(conversationId: string, cursor?: string) {
        const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
        const res = await httpClient.get<
            ApiResponse<MessagesListResponse> | MessagesListResponse
        >(`/conversations/${conversationId}/messages${query}`, { requiresAuth: true });
        return unwrap<MessagesListResponse>(res);
    },
    async sendMessage(conversationId: string, content: string) {
        const res = await httpClient.post<ApiResponse<Message> | Message>(
            `/conversations/${conversationId}/messages`,
            { content },
            { requiresAuth: true },
        );
        return unwrap<Message>(res);
    },
    async startConversation(participantId: string) {
        const res = await httpClient.post<ApiResponse<{ conversationId: string }> | { conversationId: string }>(
            "/conversations",
            { participantId },
            { requiresAuth: true },
        );
        return unwrap<{ conversationId: string }>(res);
    },
};
