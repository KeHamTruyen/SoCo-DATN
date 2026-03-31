import { Bell, MessageSquare, Package, Send, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Notification } from "../types/notification.types";

function formatRelativeTime(isoString: string) {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

const TYPE_ICON: Record<string, { icon: React.ReactNode; bgClass: string }> = {
    comment: {
        icon: <MessageSquare className="h-5 w-5" />,
        bgClass: "bg-info/10 text-info dark:bg-info/20",
    },
    like: {
        icon: <Bell className="h-5 w-5" />,
        bgClass: "bg-info/10 text-info dark:bg-info/20",
    },
    order: {
        icon: <Package className="h-5 w-5" />,
        bgClass: "bg-primary-100 text-primary dark:bg-primary-950/40",
    },
    message: {
        icon: <Send className="h-5 w-5" />,
        bgClass: "bg-info/10 text-info dark:bg-info/20",
    },
    system: {
        icon: <Tag className="h-5 w-5" />,
        bgClass: "bg-primary-100 text-primary dark:bg-primary-950/40",
    },
};

interface NotificationDropdownProps {
    notifications: Notification[];
    unreadCount: number;
    onClose: () => void;
    onMarkAllRead: () => void;
}

export function NotificationDropdown({
    notifications,
    unreadCount,
    onClose,
    onMarkAllRead,
}: NotificationDropdownProps) {
    const [visibleCount, setVisibleCount] = useState(5);

    useEffect(() => {
        setVisibleCount(5);
    }, [notifications.length]);

    const visibleNotifications = notifications.slice(0, visibleCount);
    const hasMoreNotifications = notifications.length > visibleNotifications.length;

    return (
        <div className="absolute right-0 z-50 mt-3 flex w-96 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-background-dark">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
                <h3 className="text-base font-semibold">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                            {unreadCount}
                        </span>
                    )}
                </h3>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 ? (
                        <button
                            type="button"
                            onClick={onMarkAllRead}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Mark all as read
                        </button>
                    ) : null}
                    <Link
                        to="/notifications"
                        className="text-sm font-medium text-primary hover:underline"
                        onClick={onClose}
                    >
                        See all
                    </Link>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-neutral-400">
                        No notifications
                    </div>
                ) : (
                    visibleNotifications.map((n) => {
                        const iconConf = TYPE_ICON[n.iconType ?? n.type] ?? TYPE_ICON.system;
                        const body = (
                            <div className="group relative flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                <div className="shrink-0">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${iconConf.bgClass}`}
                                    >
                                        {iconConf.icon}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm leading-tight text-neutral-800 dark:text-neutral-200">
                                        {n.actorName && (
                                            <span className="font-semibold">{n.actorName} </span>
                                        )}
                                        {n.content}
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        {formatRelativeTime(n.createdAt)}
                                    </p>
                                </div>
                                {!n.isRead && (
                                    <div className="shrink-0 self-center">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    </div>
                                )}
                            </div>
                        );

                        return n.link ? (
                            <Link key={n.id} to={n.link} onClick={onClose}>
                                {body}
                            </Link>
                        ) : (
                            <div key={n.id}>{body}</div>
                        );
                    })
                )}
            </div>

            <div className="border-t border-neutral-100 p-3 dark:border-neutral-800">
                {hasMoreNotifications ? (
                    <button
                        type="button"
                        onClick={() => setVisibleCount((count) => count + 5)}
                        className="block w-full rounded-lg py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                    >
                        View more notifications
                    </button>
                ) : (
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="block rounded-lg py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                    >
                        View all notifications
                    </Link>
                )}
            </div>
        </div>
    );
}
