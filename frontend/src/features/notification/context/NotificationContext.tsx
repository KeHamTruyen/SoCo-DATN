import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { notificationApi } from "../api/notificationApi";
import type {
    Notification,
    NotificationPreferences,
    NotificationType,
} from "../types/notification.types";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { useSocket } from "../../../shared/realtime/SocketContext";

interface NotificationContextValue {
    notifications: Notification[];
    unreadCount: number;
    hasMore: boolean;
    preferences: NotificationPreferences;
    isLoading: boolean;
    isLoadingMore: boolean;
    refresh: (type?: "all" | NotificationType) => Promise<void>;
    loadMore: (type?: "all" | NotificationType) => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
    dismissToast: (id: string) => void;
    liveToasts: Notification[];
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const DEFAULT_PREFERENCES: NotificationPreferences = {
    social: true,
    order: true,
    system: true,
};

function upsertNotification(list: Notification[], incoming: Notification) {
    const index = list.findIndex((item) => item.id === incoming.id);
    if (index === -1) return [incoming, ...list];
    const next = [...list];
    next[index] = { ...next[index], ...incoming };
    return next;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthSession();
    const socket = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [liveToasts, setLiveToasts] = useState<Notification[]>([]);

    const refresh = async (type: "all" | NotificationType = "all") => {
        setIsLoading(true);
        try {
            const data = await notificationApi.listNotifications(type, { page: 1, limit });
            if (type === "all") {
                setNotifications(data.items);
                setUnreadCount(data.unreadCount);
            } else {
                setNotifications(data.items);
            }
            setTotal(data.total);
            setPage(data.page);
            setLimit(data.limit);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = async (type: "all" | NotificationType = "all") => {
        if (isLoadingMore || notifications.length >= total) return;

        const nextPage = page + 1;
        setIsLoadingMore(true);
        try {
            const data = await notificationApi.listNotifications(type, {
                page: nextPage,
                limit,
            });
            setNotifications((prev) => {
                const seenIds = new Set(prev.map((item) => item.id));
                const nextItems = data.items.filter((item) => !seenIds.has(item.id));
                return [...prev, ...nextItems];
            });
            if (type === "all") {
                setUnreadCount(data.unreadCount);
            }
            setTotal(data.total);
            setPage(data.page);
            setLimit(data.limit);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            setUnreadCount(0);
            setTotal(0);
            setPage(1);
            setLiveToasts([]);
            return;
        }

        void Promise.all([
            refresh("all"),
            notificationApi
                .getPreferences()
                .then(setPreferences)
                .catch(() => setPreferences(DEFAULT_PREFERENCES)),
        ]);
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id || !socket) return;

        const onConnect = () => {
            void refresh("all");
        };

        socket.on("connect", onConnect);
        socket.on("reconnect", onConnect);
        socket.on("notification:new", (rawNotification: unknown) => {
            try {
                const incoming = notificationApi.mapRealtimeNotification(rawNotification);
                setNotifications((prev) => upsertNotification(prev, incoming).slice(0, 100));
                setUnreadCount((prev) => (incoming.isRead ? prev : prev + 1));
                setLiveToasts((prev) => [incoming, ...prev].slice(0, 3));
            } catch {
                // Keep realtime pipeline stable on malformed payloads.
            }
        });
        socket.on("notification:read", (payload: { id: string; unreadCount?: number }) => {
            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === payload.id ? { ...item, isRead: true } : item,
                ),
            );
            if (typeof payload.unreadCount === "number") {
                setUnreadCount(payload.unreadCount);
            } else {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        });
        socket.on("notification:read-all", (payload: { unreadCount?: number }) => {
            setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
            setUnreadCount(payload.unreadCount ?? 0);
        });

        return () => {
            socket.off("connect", onConnect);
            socket.off("reconnect", onConnect);
            socket.off("notification:new");
            socket.off("notification:read");
            socket.off("notification:read-all");
        };
    }, [user?.id, socket]);

    useEffect(() => {
        if (liveToasts.length === 0) return;
        const timer = window.setTimeout(() => {
            setLiveToasts((prev) => prev.slice(0, -1));
        }, 5000);
        return () => window.clearTimeout(timer);
    }, [liveToasts]);

    const markRead = async (id: string) => {
        let decremented = false;
        setNotifications((prev) =>
            prev.map((item) => {
                if (item.id === id && !item.isRead) {
                    decremented = true;
                    return { ...item, isRead: true };
                }
                return item;
            }),
        );
        if (decremented) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        try {
            await notificationApi.markRead(id);
        } catch {
            void refresh("all");
        }
    };

    const markAllRead = async () => {
        const previous = notifications;
        const previousUnread = unreadCount;
        setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
        setUnreadCount(0);
        try {
            await notificationApi.markAllRead();
        } catch {
            setNotifications(previous);
            setUnreadCount(previousUnread);
        }
    };

    const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
        const prev = preferences;
        setPreferences((current) => ({ ...current, ...updates }));
        try {
            const saved = await notificationApi.updatePreferences(updates);
            setPreferences(saved);
        } catch {
            setPreferences(prev);
            throw new Error("Unable to update preferences");
        }
    };

    const dismissToast = (id: string) => {
        setLiveToasts((prev) => prev.filter((item) => item.id !== id));
    };

    const value = useMemo<NotificationContextValue>(
        () => ({
            notifications,
            unreadCount,
            hasMore: notifications.length < total,
            preferences,
            isLoading,
            isLoadingMore,
            refresh,
            loadMore,
            markRead,
            markAllRead,
            updatePreferences,
            liveToasts,
            dismissToast,
        }),
        [notifications, unreadCount, total, preferences, isLoading, isLoadingMore, liveToasts],
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationCenter() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotificationCenter must be used within NotificationProvider");
    }
    return context;
}
