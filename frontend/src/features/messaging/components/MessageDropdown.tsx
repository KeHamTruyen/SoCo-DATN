import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { searchUsers } from "../../auth/api/userApi";
import type { TaggedUserBrief } from "../../feed/types/feed.types";
import { useMessagingOptional } from "../context/MessagingContext";
import type { Conversation } from "../types/messaging.types";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { DEFAULT_USER_AVATAR_URL } from "../../../shared/config/defaultAssets";
import { cn } from "../../../shared/lib/cn";

interface MessageDropdownProps {
    onClose: () => void;
}

function displayUserName(u: TaggedUserBrief): string {
    const n = u.fullName?.trim();
    if (n) return n;
    return u.username?.trim() || "User";
}

export function MessageDropdown({ onClose }: MessageDropdownProps) {
    const { t } = useTranslation();
    const { user } = useAuthSession();
    const messaging = useMessagingOptional();
    const conversations = messaging?.conversations ?? [];

    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [visibleCount, setVisibleCount] = useState(5);
    const [userHits, setUserHits] = useState<TaggedUserBrief[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(search.trim()), 300);
        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setVisibleCount(5);
    }, [filter, debounced, conversations.length]);

    useEffect(() => {
        if (debounced.length < 2) {
            setUserHits([]);
            return;
        }
        let cancelled = false;
        setSearchingUsers(true);
        void searchUsers(debounced, 10)
            .then((rows) => {
                if (cancelled) return;
                setUserHits(rows.filter((u) => u.id !== user?.id));
            })
            .finally(() => {
                if (!cancelled) setSearchingUsers(false);
            });
        return () => {
            cancelled = true;
        };
    }, [debounced, user?.id]);

    const filtered = useMemo(() => {
        let list = conversations;
        if (filter === "unread") {
            list = list.filter((c) => c.unreadCount > 0);
        }
        if (debounced.length > 0) {
            const q = debounced.toLowerCase();
            list = list.filter(
                (c) =>
                    c.participantName.toLowerCase().includes(q) ||
                    (c.lastMessage?.toLowerCase().includes(q) ?? false),
            );
        }
        return list;
    }, [conversations, filter, debounced]);

    const visibleConversations = filtered.slice(0, visibleCount);
    const hasMoreConversations = filtered.length > visibleConversations.length;

    const conversationParticipantIds = useMemo(
        () => new Set(conversations.map((c) => c.participantId)),
        [conversations],
    );

    const userSearchResults = useMemo(() => {
        if (debounced.length < 2) return [];
        return userHits.filter((u) => !conversationParticipantIds.has(u.id));
    }, [userHits, conversationParticipantIds, debounced.length]);

    const previewLine = useCallback(
        (c: Conversation) => {
            const text = c.lastMessage ?? "";
            if (c.lastMessageIsOwn && text) {
                return `${t("messaging.youPrefix")}${text}`;
            }
            return text || t("messaging.noPreview");
        },
        [t],
    );

    const openInDock = messaging?.openInDock;
    const startConversationWithUser = messaging?.startConversationWithUser;
    const refreshConversations = messaging?.refreshConversations;
    const isLoadingConversations = messaging?.isLoadingConversations ?? false;

    const handleSelectConversation = (conversationId: string) => {
        openInDock?.(conversationId);
        onClose();
    };

    const handleSelectUser = async (userId: string) => {
        if (!startConversationWithUser || !refreshConversations || !openInDock) return;
        const cid = await startConversationWithUser(userId);
        await refreshConversations();
        openInDock(cid);
        onClose();
    };

    if (!messaging) {
        return null;
    }

    return (
        <div className="absolute right-0 z-50 mt-3 flex w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl">
            <div className="border-b border-border px-3 py-3">
                <h3 className="mb-2 text-base font-semibold text-foreground">
                    {t("messaging.dropdownTitle")}
                </h3>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("messaging.dropdownSearchPlaceholder")}
                        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="mt-2 flex gap-1 rounded-lg bg-muted/50 p-0.5">
                    <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className={cn(
                            "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                            filter === "all"
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {t("messaging.filterAll")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter("unread")}
                        className={cn(
                            "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                            filter === "unread"
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {t("messaging.filterUnread")}
                    </button>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {debounced.length >= 2 && (
                    <div className="border-b border-border px-2 py-2">
                        <p className="mb-1 px-2 text-[10px] font-semibold uppercase text-muted-foreground">
                            {t("messaging.dropdownPeople")}
                        </p>
                        {searchingUsers ? (
                            <p className="px-2 py-2 text-xs text-muted-foreground">
                                {t("messaging.searchingUsers")}
                            </p>
                        ) : userSearchResults.length === 0 ? (
                            <p className="px-2 py-1 text-xs text-muted-foreground">
                                {t("messaging.noUserSearchResults")}
                            </p>
                        ) : (
                            userSearchResults.map((u) => (
                                <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => void handleSelectUser(u.id)}
                                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
                                >
                                    <div
                                        className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(${u.avatarUrl ?? DEFAULT_USER_AVATAR_URL})`,
                                        }}
                                    />
                                    <span className="truncate text-sm font-medium text-foreground">
                                        {displayUserName(u)}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {isLoadingConversations ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        {t("messaging.loadingConversations")}
                    </div>
                ) : visibleConversations.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        {t("messaging.dropdownEmpty")}
                    </div>
                ) : (
                    visibleConversations.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectConversation(c.id)}
                            className="flex w-full cursor-pointer items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/50"
                        >
                            <div
                                className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${c.participantAvatarUrl ?? DEFAULT_USER_AVATAR_URL})`,
                                }}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate text-sm font-semibold text-foreground">
                                        {c.participantName}
                                    </span>
                                    {c.unreadCount > 0 && (
                                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                                            {c.unreadCount > 99 ? "99+" : c.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {previewLine(c)}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>

            <div className="border-t border-border p-3">
                {hasMoreConversations ? (
                    <button
                        type="button"
                        onClick={() => setVisibleCount((n) => n + 5)}
                        className="mb-2 block w-full rounded-lg py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                    >
                        {t("messaging.loadMore")}
                    </button>
                ) : null}
                <Link
                    to="/messages"
                    className="block rounded-lg py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                    onClick={onClose}
                >
                    {t("messaging.viewAllMessages")}
                </Link>
            </div>
        </div>
    );
}
