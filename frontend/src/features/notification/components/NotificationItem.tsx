import { Heart, MessageSquare, Package, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../../shared/lib/cn";
import type { Notification } from "../types/notification.types";

const ICON_MAP = {
    comment: { icon: <MessageSquare className="h-3 w-3" />, bg: "bg-info" },
    like: { icon: <Heart className="h-3 w-3" />, bg: "bg-destructive" },
    follow: { icon: <User className="h-3 w-3" />, bg: "bg-success" },
    order: { icon: <Package className="h-3 w-3" />, bg: "bg-primary" },
    system: { icon: <Settings className="h-3 w-3" />, bg: "bg-info" },
};

function formatRelativeTime(isoString: string) {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

interface NotificationItemProps {
    notification: Notification;
    onRead?: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const iconConfig = notification.iconType ? ICON_MAP[notification.iconType] : null;

    const content = (
        <div
            className={cn(
                "group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all",
                notification.isRead
                    ? "border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    : "border-primary/10 bg-primary/5 hover:bg-primary/10",
            )}
            onClick={() => !notification.isRead && onRead?.(notification.id)}
        >
            {!notification.isRead && (
                <div className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
            )}

            <div className="relative shrink-0">
                {notification.actorAvatarUrl ? (
                    <>
                        <img
                            src={notification.actorAvatarUrl}
                            alt={notification.actorName}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                        {iconConfig && (
                            <div
                                className={cn(
                                    "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-white dark:border-background-dark",
                                    iconConfig.bg,
                                )}
                            >
                                {iconConfig.icon}
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full text-white",
                            notification.type === "order"
                                ? "bg-primary-100 text-primary dark:bg-primary-950/40"
                                : "bg-info/10 text-info dark:bg-info/20",
                        )}
                    >
                        {notification.type === "order" ? (
                            <Package className="h-5 w-5" />
                        ) : (
                            <Settings className="h-5 w-5" />
                        )}
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
                    {notification.actorName && (
                        <span className="font-bold">{notification.actorName} </span>
                    )}
                    {notification.content}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                    {formatRelativeTime(notification.createdAt)}
                </p>
            </div>
        </div>
    );

    return notification.link ? (
        <Link to={notification.link}>{content}</Link>
    ) : (
        content
    );
}
