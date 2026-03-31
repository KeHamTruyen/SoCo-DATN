import { Bell, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../../shared/lib/cn";
import type { Notification } from "../types/notification.types";

interface NotificationToastStackProps {
    items: Notification[];
    onDismiss: (id: string) => void;
    onOpen?: (id: string) => void;
}

function formatRelativeTime(isoString: string) {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ`;
    return `${Math.floor(hours / 24)} ngày`;
}

export function NotificationToastStack({
    items,
    onDismiss,
    onOpen,
}: NotificationToastStackProps) {
    if (items.length === 0) return null;

    return (
        <div className="pointer-events-none fixed bottom-4 left-4 z-70 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
            {items.map((notification, index) => (
                <div
                    key={notification.id}
                    className={cn(
                        "pointer-events-auto relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl ring-1 ring-black/5 transition-all dark:border-neutral-800 dark:bg-neutral-900",
                        index === 0 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-95",
                    )}
                >
                    <button
                        type="button"
                        onClick={() => onDismiss(notification.id)}
                        className="absolute right-2 top-2 z-10 rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                        aria-label="Đóng thông báo"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <Link
                        to={notification.link ?? "/notifications"}
                        onClick={() => {
                            onOpen?.(notification.id);
                            onDismiss(notification.id);
                        }}
                        className="block p-3 pr-10"
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                                {notification.actorAvatarUrl ? (
                                    <img
                                        src={notification.actorAvatarUrl}
                                        alt={notification.actorName ?? "Avatar"}
                                        className="h-11 w-11 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Bell className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    {notification.title ?? "Thông báo mới"}
                                </p>
                                <p className="mt-0.5 line-clamp-2 text-sm text-neutral-700 dark:text-neutral-300">
                                    {notification.actorName ? `${notification.actorName} ` : ""}
                                    {notification.content}
                                </p>
                                <p className="mt-1 text-xs text-primary">
                                    {formatRelativeTime(notification.createdAt)}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
}
