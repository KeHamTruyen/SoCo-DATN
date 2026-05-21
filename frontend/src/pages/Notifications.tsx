import { CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNotificationCenter } from "../features/notification/context/NotificationContext";
import { NotificationItem } from "../features/notification/components/NotificationItem";
import { cn } from "../shared/lib/cn";
import { Button } from "../shared/ui";

type TabFilter = "all" | "social" | "order" | "system";

const TABS: { value: TabFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "social", label: "Social" },
    { value: "order", label: "Orders" },
    { value: "system", label: "System" },
];

export default function Notifications() {
    const [activeTab, setActiveTab] = useState<TabFilter>("all");
    const {
        notifications,
        unreadCount,
        isLoading,
        preferences,
        markRead,
        markAllRead,
        updatePreferences,
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
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="mt-1 text-sm text-neutral-500">
                                {unreadCount} unread notification(s)
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
                            Mark all read
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
                                {tab.label}
                                {tab.value === "all" && unreadCount > 0 && (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="mb-3 text-sm font-semibold">Notification preferences</p>
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(preferences) as Array<keyof typeof preferences>).map(
                            (key) => (
                                <Button
                                    key={key}
                                    variant={preferences[key] ? "primary" : "outline"}
                                    size="sm"
                                    onClick={() =>
                                        void updatePreferences({
                                            [key]: !preferences[key],
                                        })
                                    }
                                >
                                    {key}
                                </Button>
                            ),
                        )}
                    </div>
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
                        <p className="text-neutral-400">No notifications.</p>
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

                {filteredNotifications.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <Button variant="outline">Load More</Button>
                    </div>
                )}
        </main>
    );
}
