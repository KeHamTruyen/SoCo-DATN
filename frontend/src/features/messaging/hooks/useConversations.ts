import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "../api/messagingApi";
import type { Conversation, Message } from "../types/messaging.types";
import { queryKeys } from "../../../shared/query/queryKeys";

/**
 * Manages the conversation list, loading state, and derived unread counts.
 * Exposes setters so sibling hooks (socket, threads) can update conversations.
 */
export function useConversations(userId: string | undefined) {
    const queryClient = useQueryClient();
    const conversationsKey = userId
        ? queryKeys.messaging.conversations(userId)
        : ["messaging", "conversations", "empty"];
    const conversationsQuery = useQuery({
        queryKey: conversationsKey,
        enabled: Boolean(userId),
        queryFn: async () => {
            const { items } = await messagingApi.listConversations(userId!);
            return items;
        },
    });
    const conversations = conversationsQuery.data ?? [];
    const setConversations = useCallback(
        (value: Conversation[] | ((prev: Conversation[]) => Conversation[])) => {
            queryClient.setQueryData<Conversation[]>(conversationsKey, (prev = []) =>
                typeof value === "function" ? value(prev) : value,
            );
        },
        [conversationsKey, queryClient],
    );

    const refreshConversations = useCallback(async () => {
        if (!userId) {
            setConversations([]);
            return;
        }
        await queryClient.invalidateQueries({ queryKey: conversationsKey });
    }, [conversationsKey, queryClient, setConversations, userId]);

    const totalUnread = useMemo(
        () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
        [conversations],
    );

    const unreadChatsCount = useMemo(
        () => conversations.filter((c) => c.unreadCount > 0).length,
        [conversations],
    );

    /** Helper: update a single conversation's preview after send / receive */
    const updateConversationPreview = useCallback(
        (
            conversationId: string,
            preview: string,
            createdAt: string,
            isOwn: boolean,
        ) => {
            setConversations((prev) =>
                prev.map((c) => {
                    if (c.id !== conversationId) return c;
                    return {
                        ...c,
                        lastMessage: preview,
                        lastMessageAt: createdAt,
                        lastMessageIsOwn: isOwn,
                    };
                }),
            );
        },
        [],
    );

    /** Upsert a conversation (e.g. after starting a new one). */
    const upsertConversation = useCallback(
        (conversationId: string, conversation: Conversation) => {
            setConversations((prev) => {
                const idx = prev.findIndex((c) => c.id === conversationId);
                if (idx === -1) return [conversation, ...prev];
                const next = [...prev];
                next[idx] = conversation;
                return next;
            });
        },
        [],
    );

    /** Mark a conversation as read (unreadCount = 0). */
    const clearUnread = useCallback((conversationId: string) => {
        setConversations((prev) =>
            prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
        );
    }, []);

    /** Increment unread for a conversation by 1. */
    const incrementUnread = useCallback((conversationId: string) => {
        setConversations((prev) =>
            prev.map((c) =>
                c.id === conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c,
            ),
        );
    }, []);

    return {
        conversations,
        setConversations,
        isLoading: conversationsQuery.isLoading,
        refreshConversations,
        totalUnread,
        unreadChatsCount,
        updateConversationPreview,
        upsertConversation,
        clearUnread,
        incrementUnread,
    };
}

/** Build a short preview string from a Message (for the conversation list). */
export function previewFromMessage(msg: Message, photoLabel: string): string {
    if (msg.type === "product" && msg.product) {
        return `[Product] ${msg.product.name}`;
    }
    if (msg.type === "image") {
        return photoLabel;
    }
    return msg.content;
}
