import { httpClient } from "../../../shared/api/httpClient";
import {
    mapConversationFromApi,
    mapMessageFromApi,
    type RawConversationPayload,
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

// ── API response shapes ────────────────────────────────────────────────

/** Standard backend list wrapper: `{ success, data, pagination }`. */
interface ApiListResponse<T> {
    success?: boolean;
    data?: T[];
    pagination?: PaginationMeta;
}

/** Standard backend single-item wrapper: `{ success, data }`. */
interface ApiItemResponse<T> {
    success?: boolean;
    data?: T;
}

// ── Response unwrappers ────────────────────────────────────────────────

function extractList<T>(res: ApiListResponse<T> | T[]): { items: T[]; pagination?: PaginationMeta } {
    if (Array.isArray(res)) return { items: res };
    return {
        items: Array.isArray(res.data) ? res.data : [],
        pagination: res.pagination,
    };
}

function unwrapItem<T>(res: ApiItemResponse<T> | T): T {
    if (res && typeof res === "object" && "data" in res) {
        return (res as ApiItemResponse<T>).data as T;
    }
    return res as T;
}

// ── Public API ─────────────────────────────────────────────────────────

export const messagingApi = {
    async listConversations(
        currentUserId: string,
        page = 1,
        limit = 20,
    ): Promise<ConversationsListResponse> {
        const res = await httpClient.get<ApiListResponse<RawConversationPayload>>(
            `${BASE}/conversations?page=${page}&limit=${limit}`,
            { requiresAuth: true },
        );
        const { items: rawItems, pagination } = extractList(res);
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
        const res = await httpClient.get<ApiListResponse<RawMessagePayload>>(
            `${BASE}/conversations/${encodeURIComponent(conversationId)}?page=${page}&limit=${limit}`,
            { requiresAuth: true },
        );
        const { items: rawItems, pagination } = extractList(res);
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
        const res = await httpClient.post<ApiItemResponse<RawMessagePayload>>(
            `${BASE}/conversations/${encodeURIComponent(conversationId)}`,
            payload,
            { requiresAuth: true },
        );
        const raw = unwrapItem(res);
        const msg = mapMessageFromApi(raw);
        if (!msg) throw new Error("Invalid message response");
        return msg;
    },

    async startConversation(
        userId: string,
        currentUserId: string,
    ): Promise<{ conversationId: string; conversation: Conversation }> {
        const res = await httpClient.post<ApiItemResponse<RawConversationPayload>>(
            `${BASE}/conversations`,
            { userId },
            { requiresAuth: true },
        );
        const raw = unwrapItem(res);
        const conversation = mapConversationFromApi(raw, currentUserId);
        if (!conversation || !raw?.id) {
            throw new Error("Invalid conversation response");
        }
        return { conversationId: raw.id, conversation };
    },

    async markConversationRead(conversationId: string): Promise<void> {
        await httpClient.patch(
            `${BASE}/conversations/${encodeURIComponent(conversationId)}/read`,
            {},
            { requiresAuth: true },
        );
    },
};
