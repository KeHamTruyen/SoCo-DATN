import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    type ReactNode,
} from "react";
import type { Conversation, Message } from "../types/messaging.types";
import { useConversations } from "../hooks/useConversations";
import { useMessageThreads } from "../hooks/useMessageThreads";
import { useDockState } from "../hooks/useDockState";
import { useMessageSocket } from "../hooks/useMessageSocket";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { useSocket } from "../../../shared/realtime/SocketContext";

// ── Public context interface ───────────────────────────────────────────

export interface MessagingContextValue {
    conversations: Conversation[];
    messageThreads: Record<string, Message[]>;
    /** Total unread messages across all conversations. */
    totalUnread: number;
    /** Number of conversations with unread messages (for header badge). */
    unreadChatsCount: number;
    dockOpenIds: string[];
    /** Conversation ids for dock shortcut avatars (FIFO, max 5). */
    dockAvatarIds: string[];
    isLoadingConversations: boolean;
    refreshConversations: () => Promise<void>;
    loadMessagesForConversation: (conversationId: string) => Promise<Message[]>;
    sendMessage: (
        conversationId: string,
        body:
            | string
            | { messageType: "IMAGE"; mediaUrl: string; content?: string | null },
    ) => Promise<Message>;
    markConversationRead: (conversationId: string) => Promise<void>;
    startConversationWithUser: (userId: string) => Promise<string>;
    setActiveConversationId: (conversationId: string | null) => void;
    openInDock: (conversationId: string) => void;
    /** Hide panel but keep avatar shortcut. */
    minimizeDockChat: (conversationId: string) => void;
    /** Close completely: remove panel and avatar. */
    closeDockChat: (conversationId: string) => void;
    /** Avatar toggle: open panel if closed, minimize if open. */
    toggleDockPanel: (conversationId: string) => void;
    setDockOpenIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    /** When true, dock shows chat panels + avatar strip (FAB expanded). */
    dockExpanded: boolean;
    setDockExpanded: (value: boolean | ((prev: boolean) => boolean)) => void;
}

// ── Context ────────────────────────────────────────────────────────────

const MessagingContext = createContext<MessagingContextValue | null>(null);

// ── Provider (composition root) ────────────────────────────────────────

export function MessagingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthSession();
    const socket = useSocket();
    const activeConversationIdRef = useRef<string | null>(null);

    // 1. Conversations
    const {
        conversations,
        isLoading: isLoadingConversations,
        refreshConversations,
        totalUnread,
        unreadChatsCount,
        updateConversationPreview,
        upsertConversation,
        clearUnread,
        incrementUnread,
    } = useConversations(user?.id);

    // 2. Message threads
    const {
        messageThreads,
        loadMessagesForConversation,
        sendMessage,
        markConversationRead,
        startConversationWithUser,
        appendSocketMessage,
        resetThreads,
    } = useMessageThreads({
        userId: user?.id,
        updateConversationPreview,
        upsertConversation,
        clearUnread,
    });

    // 3. Dock UI state
    const {
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
    } = useDockState({ loadMessagesForConversation, markConversationRead });

    // 4. Socket integration
    useMessageSocket({
        socket,
        userId: user?.id,
        conversations,
        activeConversationIdRef,
        dockOpenIdsRef,
        appendSocketMessage,
        updateConversationPreview,
        incrementUnread,
        clearUnread,
        refreshConversations,
    });

    // Reset everything on logout
    useEffect(() => {
        if (!user?.id) {
            resetThreads();
            resetDock();
        }
    }, [user?.id, resetThreads, resetDock]);

    const setActiveConversationId = useCallback(
        (conversationId: string | null) => {
            activeConversationIdRef.current = conversationId;
        },
        [],
    );

    // ── Compose context value ──────────────────────────────────────────

    const value = useMemo<MessagingContextValue>(
        () => ({
            conversations,
            messageThreads,
            totalUnread,
            unreadChatsCount,
            dockOpenIds,
            dockAvatarIds,
            isLoadingConversations,
            refreshConversations,
            loadMessagesForConversation,
            sendMessage,
            markConversationRead,
            startConversationWithUser,
            setActiveConversationId,
            openInDock,
            minimizeDockChat,
            closeDockChat,
            toggleDockPanel,
            setDockOpenIds,
            dockExpanded,
            setDockExpanded,
        }),
        [
            conversations,
            messageThreads,
            totalUnread,
            unreadChatsCount,
            dockOpenIds,
            dockAvatarIds,
            dockExpanded,
            isLoadingConversations,
            refreshConversations,
            loadMessagesForConversation,
            sendMessage,
            markConversationRead,
            startConversationWithUser,
            setActiveConversationId,
            openInDock,
            minimizeDockChat,
            closeDockChat,
            toggleDockPanel,
        ],
    );

    return (
        <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>
    );
}

// ── Consumer hooks ─────────────────────────────────────────────────────

/** Returns null outside `MessagingProvider` (safe for optional UI like header). */
export function useMessagingOptional(): MessagingContextValue | null {
    return useContext(MessagingContext);
}

export function useMessaging(): MessagingContextValue {
    const ctx = useContext(MessagingContext);
    if (!ctx) {
        throw new Error("useMessaging must be used within MessagingProvider");
    }
    return ctx;
}
