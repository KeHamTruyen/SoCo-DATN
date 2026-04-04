import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import i18n from "../../../i18n";
import { messagingApi } from "../api/messagingApi";
import type { Conversation, Message } from "../types/messaging.types";
import { mapMessageFromApi } from "../utils/messagingMappers";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { useSocket } from "../../../shared/realtime/SocketContext";

const MAX_DOCK_CHATS = 3;
const MAX_DOCK_AVATARS = 5;

export interface MessagingContextValue {
    conversations: Conversation[];
    messageThreads: Record<string, Message[]>;
    /** Tổng số tin chưa đọc (tất cả cuộc trò chuyện) */
    totalUnread: number;
    /** Số cuộc trò chuyện có tin chưa đọc (số người / thread), dùng cho badge header */
    unreadChatsCount: number;
    dockOpenIds: string[];
    /** Conversation ids for dock shortcut avatars (FIFO, max 5) */
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
    /** Ẩn panel nhưng giữ avatar shortcut */
    minimizeDockChat: (conversationId: string) => void;
    /** Đóng hẳn: gỡ panel và avatar */
    closeDockChat: (conversationId: string) => void;
    /** Avatar: mở panel nếu đang đóng, thu nhỏ nếu đang mở */
    toggleDockPanel: (conversationId: string) => void;
    setDockOpenIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    /** When true, dock shows chat panels + avatar strip (FAB expanded) */
    dockExpanded: boolean;
    setDockExpanded: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const MessagingContext = createContext<MessagingContextValue | null>(null);

function previewFromMessage(msg: Message): string {
    if (msg.type === "product" && msg.product) {
        return `[Product] ${msg.product.name}`;
    }
    if (msg.type === "image") {
        return i18n.t("messaging.previewPhoto");
    }
    return msg.content;
}

export function MessagingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthSession();
    const socket = useSocket();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messageThreads, setMessageThreads] = useState<Record<string, Message[]>>({});
    const [dockOpenIds, setDockOpenIds] = useState<string[]>([]);
    const [dockAvatarIds, setDockAvatarIds] = useState<string[]>([]);
    const [dockExpanded, setDockExpanded] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);

    const activeConversationIdRef = useRef<string | null>(null);
    /** Conversations with an open dock panel — treat as "viewing" for unread + socket (not only /messages). */
    const dockOpenIdsRef = useRef<string[]>([]);
    const joinedRoomsRef = useRef<Set<string>>(new Set());
    const refreshConversationsRef = useRef<() => Promise<void>>(async () => {});

    useEffect(() => {
        dockOpenIdsRef.current = dockOpenIds;
    }, [dockOpenIds]);

    const setActiveConversationId = useCallback((conversationId: string | null) => {
        activeConversationIdRef.current = conversationId;
    }, []);

    const refreshConversations = useCallback(async () => {
        if (!user?.id) {
            setConversations([]);
            return;
        }
        setIsLoadingConversations(true);
        try {
            const { items } = await messagingApi.listConversations(user.id);
            setConversations(items);
        } catch {
            setConversations([]);
        } finally {
            setIsLoadingConversations(false);
        }
    }, [user?.id]);

    refreshConversationsRef.current = refreshConversations;

    useEffect(() => {
        if (!user?.id) {
            setConversations([]);
            setMessageThreads({});
            setDockOpenIds([]);
            setDockAvatarIds([]);
            setDockExpanded(false);
            return;
        }
        void refreshConversations();
    }, [user?.id, refreshConversations]);

    const totalUnread = useMemo(
        () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
        [conversations],
    );

    const unreadChatsCount = useMemo(
        () => conversations.filter((c) => c.unreadCount > 0).length,
        [conversations],
    );

    const loadMessagesForConversation = useCallback(async (conversationId: string) => {
        const { items } = await messagingApi.listMessages(conversationId);
        setMessageThreads((prev) => ({ ...prev, [conversationId]: items }));
        return items;
    }, []);

    const sendMessage = useCallback(
        async (
            conversationId: string,
            body:
                | string
                | { messageType: "IMAGE"; mediaUrl: string; content?: string | null },
        ) => {
            const msg = await messagingApi.sendMessage(conversationId, body);
            setMessageThreads((prev) => {
                const list = prev[conversationId] ?? [];
                if (list.some((m) => m.id === msg.id)) return prev;
                return { ...prev, [conversationId]: [...list, msg] };
            });
            setConversations((prev) =>
                prev.map((c) => {
                    if (c.id !== conversationId) return c;
                    return {
                        ...c,
                        lastMessage: previewFromMessage(msg),
                        lastMessageAt: msg.createdAt,
                        lastMessageIsOwn: true,
                    };
                }),
            );
            return msg;
        },
        [],
    );

    const markConversationRead = useCallback(async (conversationId: string) => {
        await messagingApi.markConversationRead(conversationId);
        setConversations((prev) =>
            prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
        );
    }, []);

    const startConversationWithUser = useCallback(
        async (otherUserId: string) => {
            if (!user?.id) throw new Error("Not authenticated");
            const { conversationId, conversation } = await messagingApi.startConversation(
                otherUserId,
                user.id,
            );
            setConversations((prev) => {
                const idx = prev.findIndex((c) => c.id === conversationId);
                if (idx === -1) return [conversation, ...prev];
                const next = [...prev];
                next[idx] = conversation;
                return next;
            });
            return conversationId;
        },
        [user?.id],
    );

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

    /** Join Socket.IO rooms for all loaded conversations */
    useEffect(() => {
        if (!socket || !user?.id) return;

        const ids = new Set(conversations.map((c) => c.id));
        for (const id of joinedRoomsRef.current) {
            if (!ids.has(id)) {
                socket.emit("conversation:leave", id);
                joinedRoomsRef.current.delete(id);
            }
        }
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
    }, [socket, user?.id, conversations]);

    useEffect(() => {
        if (!socket || !user?.id) return;

        const onNew = (raw: unknown) => {
            const msg = mapMessageFromApi(raw);
            if (!msg) return;

            setMessageThreads((prev) => {
                const list = prev[msg.conversationId];
                if (!list) return prev;
                if (list.some((m) => m.id === msg.id)) return prev;
                return { ...prev, [msg.conversationId]: [...list, msg] };
            });

            setConversations((prev) => {
                const exists = prev.some((c) => c.id === msg.conversationId);
                if (!exists) {
                    void refreshConversationsRef.current();
                    return prev;
                }

                return prev.map((c) => {
                    if (c.id !== msg.conversationId) return c;
                    const fromSelf = msg.senderId === user.id;
                    const viewing =
                        activeConversationIdRef.current === msg.conversationId ||
                        dockOpenIdsRef.current.includes(msg.conversationId);
                    let unread = c.unreadCount;
                    if (!fromSelf && !viewing) unread = c.unreadCount + 1;
                    if (!fromSelf && viewing) unread = 0;
                    return {
                        ...c,
                        lastMessage: previewFromMessage(msg),
                        lastMessageAt: msg.createdAt,
                        lastMessageIsOwn: fromSelf,
                        unreadCount: unread,
                    };
                });
            });

            const isViewingThread =
                activeConversationIdRef.current === msg.conversationId ||
                dockOpenIdsRef.current.includes(msg.conversationId);
            if (msg.senderId !== user.id && isViewingThread) {
                void messagingApi.markConversationRead(msg.conversationId).catch(() => {});
            }
        };

        socket.on("message:new", onNew);
        return () => {
            socket.off("message:new", onNew);
        };
    }, [socket, user?.id]);

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
