import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "../types/messaging.types";

const MAX_DOCK_CHATS = 3;
const MAX_DOCK_AVATARS = 5;

interface UseDockStateOptions {
    loadMessagesForConversation: (conversationId: string) => Promise<Message[]>;
    markConversationRead: (conversationId: string) => Promise<void>;
}

/**
 * Pure UI state for the bottom-right chat dock (panels, avatars, expanded).
 * Contains no business logic — just manages which panels are open.
 */
export function useDockState({
    loadMessagesForConversation,
    markConversationRead,
}: UseDockStateOptions) {
    const [dockOpenIds, setDockOpenIds] = useState<string[]>([]);
    const [dockAvatarIds, setDockAvatarIds] = useState<string[]>([]);
    const [dockExpanded, setDockExpanded] = useState(false);

    /** Keep a ref in sync so socket handler can read without stale closures. */
    const dockOpenIdsRef = useRef<string[]>([]);
    useEffect(() => {
        dockOpenIdsRef.current = dockOpenIds;
    }, [dockOpenIds]);

    const openInDock = useCallback(
        (conversationId: string) => {
            setDockExpanded(true);
            setDockAvatarIds((prev) => {
                const without = prev.filter((id) => id !== conversationId);
                return [conversationId, ...without].slice(0, MAX_DOCK_AVATARS);
            });
            setDockOpenIds((prev) => {
                const without = prev.filter((id) => id !== conversationId);
                return [conversationId, ...without].slice(0, MAX_DOCK_CHATS);
            });
            void loadMessagesForConversation(conversationId);
            void markConversationRead(conversationId);
        },
        [loadMessagesForConversation, markConversationRead],
    );

    const minimizeDockChat = useCallback((conversationId: string) => {
        setDockOpenIds((prev) => prev.filter((id) => id !== conversationId));
    }, []);

    const closeDockChat = useCallback((conversationId: string) => {
        setDockOpenIds((prev) => prev.filter((id) => id !== conversationId));
        setDockAvatarIds((prev) => prev.filter((id) => id !== conversationId));
    }, []);

    const toggleDockPanel = useCallback(
        (conversationId: string) => {
            let opening = false;
            setDockOpenIds((prev) => {
                if (prev.includes(conversationId)) {
                    return prev.filter((id) => id !== conversationId);
                }
                opening = true;
                const without = prev.filter((id) => id !== conversationId);
                return [conversationId, ...without].slice(0, MAX_DOCK_CHATS);
            });
            if (opening) {
                setDockExpanded(true);
                setDockAvatarIds((prev) => {
                    const without = prev.filter((id) => id !== conversationId);
                    return [conversationId, ...without].slice(0, MAX_DOCK_AVATARS);
                });
                void loadMessagesForConversation(conversationId);
                void markConversationRead(conversationId);
            }
        },
        [loadMessagesForConversation, markConversationRead],
    );

    /** Reset dock state (on logout). */
    const resetDock = useCallback(() => {
        setDockOpenIds([]);
        setDockAvatarIds([]);
        setDockExpanded(false);
    }, []);

    return {
        dockOpenIds,
        setDockOpenIds,
        dockAvatarIds,
        dockExpanded,
        setDockExpanded,
        dockOpenIdsRef,
        openInDock,
        minimizeDockChat,
        closeDockChat,
        toggleDockPanel,
        resetDock,
    };
}
