import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "../api/messagingApi";
import type { Conversation, Message } from "../types/messaging.types";
import { previewFromMessage } from "./useConversations";
import i18n from "../../../i18n";
import { queryKeys } from "../../../shared/query/queryKeys";

interface UseMessageThreadsOptions {
    userId: string | undefined;
    updateConversationPreview: (
        conversationId: string,
        preview: string,
        createdAt: string,
        isOwn: boolean,
    ) => void;
    upsertConversation: (conversationId: string, conversation: Conversation) => void;
    clearUnread: (conversationId: string) => void;
}

/**
 * Manages per-conversation message threads and CRUD operations
 * (load, send, mark-read, start-conversation).
 */
export function useMessageThreads({
    userId,
    updateConversationPreview,
    upsertConversation,
    clearUnread,
}: UseMessageThreadsOptions) {
    const queryClient = useQueryClient();
    const [messageThreads, setMessageThreads] = useState<Record<string, Message[]>>({});

    const loadMessagesForConversation = useCallback(
        async (conversationId: string) => {
            const items = await queryClient.fetchQuery({
                queryKey: queryKeys.messaging.messages(conversationId),
                queryFn: async () => {
                    const response = await messagingApi.listMessages(conversationId);
                    return response.items;
                },
            });
            setMessageThreads((prev) => ({ ...prev, [conversationId]: items }));
            return items;
        },
        [queryClient],
    );

    const sendMessage = useCallback(
        async (
            conversationId: string,
            body:
                | string
                | { messageType: "IMAGE"; mediaUrl: string; content?: string | null },
        ) => {
            const msg = await messagingApi.sendMessage(conversationId, body);

            // Append to thread (deduplicate)
            setMessageThreads((prev) => {
                const list = prev[conversationId] ?? [];
                if (list.some((m) => m.id === msg.id)) return prev;
                return { ...prev, [conversationId]: [...list, msg] };
            });
            queryClient.setQueryData<Message[]>(
                queryKeys.messaging.messages(conversationId),
                (prev = []) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]),
            );

            // Update conversation preview
            updateConversationPreview(
                conversationId,
                previewFromMessage(msg, i18n.t("messaging.previewPhoto")),
                msg.createdAt,
                true,
            );

            return msg;
        },
        [queryClient, updateConversationPreview],
    );

    const markConversationRead = useCallback(
        async (conversationId: string) => {
            await messagingApi.markConversationRead(conversationId);
            clearUnread(conversationId);
        },
        [clearUnread],
    );

    const startConversationWithUser = useCallback(
        async (otherUserId: string) => {
            if (!userId) throw new Error("Not authenticated");
            const { conversationId, conversation } =
                await messagingApi.startConversation(otherUserId, userId);
            upsertConversation(conversationId, conversation);
            return conversationId;
        },
        [userId, upsertConversation],
    );

    /** Append a message received from Socket (deduplicate). */
    const appendSocketMessage = useCallback((msg: Message) => {
        setMessageThreads((prev) => {
            const list = prev[msg.conversationId];
            if (!list) return prev; // thread not loaded — skip
            if (list.some((m) => m.id === msg.id)) return prev;
            return { ...prev, [msg.conversationId]: [...list, msg] };
        });
    }, []);

    /** Reset all threads (e.g. on logout). */
    const resetThreads = useCallback(() => {
        setMessageThreads({});
    }, []);

    return {
        messageThreads,
        loadMessagesForConversation,
        sendMessage,
        markConversationRead,
        startConversationWithUser,
        appendSocketMessage,
        resetThreads,
    };
}
