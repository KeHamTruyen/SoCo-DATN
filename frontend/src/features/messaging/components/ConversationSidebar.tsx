import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Conversation } from "../types/messaging.types";
import { DEFAULT_USER_AVATAR_URL } from "../../../shared/config/defaultAssets";
import { cn } from "../../../shared/lib/cn";

interface ConversationSidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    isLoading: boolean;
    onSelect: (conversationId: string) => void;
}

export function ConversationSidebar({
    conversations,
    activeConversationId,
    isLoading,
    onSelect,
}: ConversationSidebarProps) {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return conversations;
        return conversations.filter((c) => c.participantName.toLowerCase().includes(q));
    }, [conversations, query]);

    return (
        <aside className="flex w-80 shrink-0 flex-col border-r border-border bg-card">
            <div className="p-4">
                <h1 className="mb-4 text-xl font-bold text-foreground">{t("messaging.title")}</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("messaging.searchChats")}
                        className="w-full rounded-lg border-0 bg-muted py-2 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/50"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="space-y-3 p-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                                    <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                        {t("messaging.noConversations")}
                    </div>
                ) : (
                    filtered.map((conv) => (
                        <button
                            key={conv.id}
                            type="button"
                            onClick={() => onSelect(conv.id)}
                            className={cn(
                                "flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left transition-colors",
                                activeConversationId === conv.id
                                    ? "border-r-4 border-primary bg-primary/5"
                                    : "hover:bg-muted/60",
                            )}
                        >
                            <div className="relative shrink-0">
                                <div
                                    className="h-12 w-12 rounded-full bg-muted bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url(${conv.participantAvatarUrl ?? DEFAULT_USER_AVATAR_URL})`,
                                    }}
                                />
                                {conv.isOnline && (
                                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <h3
                                        className={cn(
                                            "truncate text-sm",
                                            activeConversationId === conv.id
                                                ? "font-bold text-foreground"
                                                : "font-semibold text-foreground",
                                        )}
                                    >
                                        {conv.participantName}
                                    </h3>
                                    <span
                                        className={cn(
                                            "shrink-0 text-[10px]",
                                            activeConversationId === conv.id
                                                ? "font-medium text-primary"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        {conv.lastMessageAt
                                            ? new Date(conv.lastMessageAt).toLocaleTimeString(
                                                  undefined,
                                                  { hour: "2-digit", minute: "2-digit" },
                                              )
                                            : ""}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-xs text-muted-foreground">
                                        {conv.lastMessageIsOwn && conv.lastMessage
                                            ? `${t("messaging.youPrefix")}${conv.lastMessage}`
                                            : (conv.lastMessage ?? "")}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </aside>
    );
}
