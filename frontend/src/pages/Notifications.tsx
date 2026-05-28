import { CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotificationCenter } from "../features/notification/context/NotificationContext";
import { NotificationItem } from "../features/notification/components/NotificationItem";
import { cn } from "../shared/lib/cn";
import { Button } from "../shared/ui";

type TabFilter = "all" | "social" | "order" | "system";

const TABS: { value: TabFilter; labelKey: string }[] = [
    { value: "all", labelKey: "notifications.tabs.all" },
    { value: "social", labelKey: "notifications.tabs.social" },
    { value: "order", labelKey: "notifications.tabs.orders" },
    { value: "system", labelKey: "notifications.tabs.system" },
];

export default function Notifications() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabFilter>("all");
    const {
        notifications,
        unreadCount,
        hasMore,
        isLoading,
        isLoadingMore,
        markRead,
        markAllRead,
        loadMore,
    } = useNotificationCenter();

    const handleMarkAllRead = async () => {
        await markAllRead();
    };

    const handleRead = async (id: string) => {
        await markRead(id);
    };

    const filteredNotifications = useMemo(() => {
        if (activeTab === "all") return notifications;
        return notifications.filter((item) => item.type === activeTab);
    }, [activeTab, notifications]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {t("notifications.title")}
                        </h1>
                        {unreadCount > 0 && (
                            <p className="mt-1 text-sm text-neutral-500">
                                {t("notifications.unreadCount", {
                                    count: unreadCount,
                                })}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => void handleMarkAllRead()}
                        >
                            <CheckCheck className="h-4 w-4" />
                            {t("notifications.markAllRead")}
                        </Button>
                    )}
                </div>

                <div className="mb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <nav className="flex space-x-8">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors",
                                    activeTab === tab.value
                                        ? "border-primary font-bold text-primary"
                                        : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300",
                                )}
                            >
                                {t(tab.labelKey)}
                                {tab.value === "all" && unreadCount > 0 && (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
                            />
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
                        <p className="text-neutral-400">
                            {t("notifications.empty")}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredNotifications.map((n) => (
                            <NotificationItem
                                key={n.id}
                                notification={n}
                                onRead={(id) => void handleRead(id)}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && (filteredNotifications.length > 0 || hasMore) && (
                    <div className="mt-6 flex justify-center">
                        <Button
                            variant="outline"
                            disabled={!hasMore || isLoadingMore}
                            onClick={() => void loadMore("all")}
                        >
                            {isLoadingMore
                                ? t("common.loading", "Đang tải...")
                                : hasMore
                                  ? t("notifications.loadMore")
                                  : t("notifications.noMore", "Đã hết thông báo")}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
