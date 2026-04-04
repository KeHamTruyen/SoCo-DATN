import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "../types/messaging.types";
import { mapMessageFromApi } from "../utils/messagingMappers";
import { previewFromMessage } from "./useConversations";
import { messagingApi } from "../api/messagingApi";
import i18n from "../../../i18n";

interface UseMessageSocketOptions {
    socket: Socket | null;
    userId: string | undefined;
    conversations: Conversation[];
    /** Ref so we can read without stale closures. */
    activeConversationIdRef: React.RefObject<string | null>;
    dockOpenIdsRef: React.RefObject<string[]>;
    appendSocketMessage: (msg: Message) => void;
    updateConversationPreview: (
        conversationId: string,
        preview: string,
        createdAt: string,
        isOwn: boolean,
    ) => void;
    incrementUnread: (conversationId: string) => void;
    clearUnread: (conversationId: string) => void;
    refreshConversations: () => Promise<void>;
}

/**
 * Handles Socket.IO room management and incoming message events.
 * Separated from the context so socket concerns are isolated.
 */
export function useMessageSocket({
    socket,
    userId,
    conversations,
    activeConversationIdRef,
    dockOpenIdsRef,
    appendSocketMessage,
    updateConversationPreview,
    incrementUnread,
    clearUnread,
    refreshConversations,
}: UseMessageSocketOptions) {
    const joinedRoomsRef = useRef<Set<string>>(new Set());
    const refreshRef = useRef(refreshConversations);
    refreshRef.current = refreshConversations;

    // Join / leave Socket rooms as conversation list changes
    useEffect(() => {
        if (!socket || !userId) return;

        const ids = new Set(conversations.map((c) => c.id));

        // Leave rooms that no longer exist
        for (const id of joinedRoomsRef.current) {
            if (!ids.has(id)) {
                socket.emit("conversation:leave", id);
                joinedRoomsRef.current.delete(id);
            }
        }
        // Join new rooms
        for (const id of ids) {
            if (!joinedRoomsRef.current.has(id)) {
                socket.emit("conversation:join", id);
                joinedRoomsRef.current.add(id);
            }
        }

        return () => {
            if (!socket) return;
            for (const id of joinedRoomsRef.current) {
                socket.emit("conversation:leave", id);
            }
            joinedRoomsRef.current.clear();
        };
    }, [socket, userId, conversations]);

    // Listen for incoming messages
    useEffect(() => {
        if (!socket || !userId) return;

        const onNewMessage = (raw: unknown) => {
            const msg = mapMessageFromApi(raw);
            if (!msg) return;

            // Append to loaded thread
            appendSocketMessage(msg);

            // Update conversation preview + unread
            const fromSelf = msg.senderId === userId;
            const isViewing =
                activeConversationIdRef.current === msg.conversationId ||
                (dockOpenIdsRef.current?.includes(msg.conversationId) ?? false);

            // Check if conversation exists
            const convExists = conversations.some((c) => c.id === msg.conversationId);
            if (!convExists) {
                void refreshRef.current();
                return;
            }

            updateConversationPreview(
                msg.conversationId,
                previewFromMessage(msg, i18n.t("messaging.previewPhoto")),
                msg.createdAt,
                fromSelf,
            );

            if (!fromSelf && !isViewing) {
                incrementUnread(msg.conversationId);
            }
            if (!fromSelf && isViewing) {
                clearUnread(msg.conversationId);
                void messagingApi.markConversationRead(msg.conversationId).catch(() => {});
            }
        };

        socket.on("message:new", onNewMessage);
        return () => {
            socket.off("message:new", onNewMessage);
        };
    }, [
        socket,
        userId,
        conversations,
        activeConversationIdRef,
        dockOpenIdsRef,
        appendSocketMessage,
        updateConversationPreview,
        incrementUnread,
        clearUnread,
    ]);
}
