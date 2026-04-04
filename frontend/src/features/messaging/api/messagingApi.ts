import { httpClient } from "../../../shared/api/httpClient";
import {
    mapConversationFromApi,
    mapMessageFromApi,
    type RawMessagePayload,
} from "../utils/messagingMappers";
import type {
    Conversation,
    ConversationsListResponse,
    Message,
    MessagesListResponse,
    PaginationMeta,
} from "../types/messaging.types";

const BASE = "/messages";

interface WrappedListResponse<T> {
    success?: boolean;
    data?: T;
    pagination?: PaginationMeta;
}

function extractArray<T>(res: unknown): { items: T[]; pagination?: PaginationMeta } {
    if (res && typeof res === "object" && "data" in res) {
        const data = (res as WrappedListResponse<T[]>).data;
        const pagination = (res as WrappedListResponse<T[]>).pagination;
        const items = Array.isArray(data) ? data : [];
        return { items, pagination };
    }
    if (Array.isArray(res)) return { items: res as T[] };
    return { items: [] };
}

function unwrapData<T>(res: unknown): T {
    if (res && typeof res === "object" && "data" in res && (res as { data: unknown }).data !== undefined) {
        return (res as { data: T }).data;
    }
    return res as T;
}

export const messagingApi = {
    async listConversations(
        currentUserId: string,
        page = 1,
        limit = 20,
    ): Promise<ConversationsListResponse> {
        const res = await httpClient.get<unknown>(
            `${BASE}/conversations?page=${page}&limit=${limit}`,
            { requiresAuth: true },
        );
        const { items: rawItems, pagination } = extractArray<unknown>(res);
        const items: Conversation[] = [];
        for (const raw of rawItems) {
            const c = mapConversationFromApi(raw, currentUserId);
            if (c) items.push(c);
        }
        return { items, pagination };
    },

    async listMessages(
        conversationId: string,
        page = 1,
        limit = 50,
    ): Promise<MessagesListResponse> {
        const res = await httpClient.get<unknown>(
            `${BASE}/conversations/${encodeURIComponent(conversationId)}?page=${page}&limit=${limit}`,
            { requiresAuth: true },
        );
        const { items: rawItems, pagination } = extractArray<RawMessagePayload>(res);
        const items: Message[] = [];
        for (const raw of rawItems) {
            const m = mapMessageFromApi(raw);
            if (m) items.push(m);
        }
        return { items, pagination };
    },

    async sendMessage(
        conversationId: string,
        body:
            | string
            | {
                  messageType: "IMAGE";
                  mediaUrl: string;
                  content?: string | null;
              },
    ): Promise<Message> {
        const payload =
            typeof body === "string"
                ? { content: body }
                : {
                      messageType: "IMAGE" as const,
                      mediaUrl: body.mediaUrl,
                      content: body.content ?? null,
                  };
        const res = await httpClient.post<unknown>(
            `${BASE}/conversations/${encodeURIComponent(conversationId)}`,
            payload,
            { requiresAuth: true },
        );
        const raw = unwrapData<unknown>(res);
        const msg = mapMessageFromApi(raw);
        if (!msg) throw new Error("Invalid message response");
        return msg;
    },

    async startConversation(
        userId: string,
        currentUserId: string,
    ): Promise<{ conversationId: string; conversation: Conversation }> {
        const res = await httpClient.post<unknown>(
            `${BASE}/conversations`,
            { userId },
            { requiresAuth: true },
        );
        const raw = unwrapData<unknown>(res);
        const conversation = mapConversationFromApi(raw, currentUserId);
        if (!conversation || !raw || typeof raw !== "object" || !("id" in raw)) {
            throw new Error("Invalid conversation response");
        }
        return { conversationId: (raw as { id: string }).id, conversation };
    },

    async markConversationRead(conversationId: string): Promise<void> {
        await httpClient.patch(
            `${BASE}/conversations/${encodeURIComponent(conversationId)}/read`,
            {},
            { requiresAuth: true },
        );
    },
};
