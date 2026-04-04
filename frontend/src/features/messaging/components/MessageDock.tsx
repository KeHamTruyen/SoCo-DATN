import { ChevronDown, MessageCircle, Minus, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { uploadApi } from "../../upload/api/uploadApi";
import { useMessagingOptional } from "../context/MessagingContext";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { DEFAULT_USER_AVATAR_URL } from "../../../shared/config/defaultAssets";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";

export function MessageDock() {
    const { t } = useTranslation();
    const { user } = useAuthSession();
    const messaging = useMessagingOptional();
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [sendingId, setSendingId] = useState<string | null>(null);

    const sendMessage = messaging?.sendMessage;
    const handleSend = useCallback(
        async (conversationId: string) => {
            const text = inputs[conversationId]?.trim();
            if (!text || !sendMessage) return;
            setSendingId(conversationId);
            setInputs((prev) => ({ ...prev, [conversationId]: "" }));
            try {
                await sendMessage(conversationId, text);
            } catch {
                setInputs((prev) => ({ ...prev, [conversationId]: text }));
            } finally {
                setSendingId(null);
            }
        },
        [inputs, sendMessage],
    );

    const handleAttachImage = useCallback(
        async (conversationId: string, file: File) => {
            if (!sendMessage) return;
            setSendingId(conversationId);
            try {
                const { url } = await uploadApi.uploadPostMedia(file);
                await sendMessage(conversationId, {
                    messageType: "IMAGE",
                    mediaUrl: url,
                });
            } finally {
                setSendingId(null);
            }
        },
        [sendMessage],
    );

    if (!user) return null;
    if (!messaging) return null;

    const {
        conversations,
        messageThreads,
        dockOpenIds,
        dockAvatarIds,
        dockExpanded,
        setDockExpanded,
        minimizeDockChat,
        closeDockChat,
        toggleDockPanel,
        loadMessagesForConversation,
    } = messaging;

    return (
        <div className="fixed bottom-4 right-4 z-40 flex max-w-[100vw] flex-row items-end gap-3 pl-2">
            {/* Chat panels — left of the avatar column */}
            {dockExpanded && dockOpenIds.length > 0 && (
                <div className="flex flex-row items-end gap-2">
                    {dockOpenIds.map((id) => {
                        const conv = conversations.find((c) => c.id === id);
                        const msgs = messageThreads[id] ?? [];
                        return (
                            <div
                                key={id}
                                className="flex h-[min(420px,calc(100vh-8rem))] w-[min(340px,calc(100vw-2rem))] flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-xl"
                            >
                                <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div
                                            className="h-8 w-8 shrink-0 rounded-full bg-cover bg-center"
                                            style={{
                                                backgroundImage: `url(${conv?.participantAvatarUrl ?? DEFAULT_USER_AVATAR_URL})`,
                                            }}
                                        />
                                        <span className="truncate text-sm font-semibold text-foreground">
                                            {conv?.participantName ??
                                                t(
                                                    "messaging.loadingConversation",
                                                )}
                                        </span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-0.5">
                                        <Link
                                            to="/messages"
                                            className="rounded px-2 py-1 text-[10px] font-medium text-primary hover:bg-muted/60"
                                            onClick={() =>
                                                loadMessagesForConversation(id)
                                            }
                                        >
                                            {t("messaging.dockOpenMessenger")}
                                        </Link>
                                        <button
                                            type="button"
                                            className="group rounded-md p-1.5 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
                                            onClick={() => minimizeDockChat(id)}
                                            aria-label={t(
                                                "messaging.dockMinimize",
                                            )}
                                        >
                                            <Minus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                        </button>
                                        <button
                                            type="button"
                                            className="group rounded-md p-1.5 text-muted-foreground transition-all duration-200 hover:bg-destructive/15 hover:text-destructive active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/45"
                                            onClick={() => closeDockChat(id)}
                                            aria-label={t(
                                                "messaging.dockClose",
                                            )}
                                        >
                                            <X className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-90" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                                    <MessageList
                                        messages={msgs}
                                        currentUserId={user.id}
                                    />
                                </div>
                                <MessageComposer
                                    value={inputs[id] ?? ""}
                                    onChange={(v) =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            [id]: v,
                                        }))
                                    }
                                    onSend={() => void handleSend(id)}
                                    onAttachImage={(file) =>
                                        void handleAttachImage(id, file)
                                    }
                                    disabled={sendingId === id}
                                    sending={sendingId === id}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Avatars column + FAB — right edge */}
            <div className="flex flex-col items-center gap-2">
                {dockExpanded && dockAvatarIds.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {dockAvatarIds.map((id) => {
                            const c = conversations.find(
                                (conv) => conv.id === id,
                            );
                            if (!c) return null;
                            const panelOpen = dockOpenIds.includes(id);
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => toggleDockPanel(id)}
                                    className={`relative h-10 w-10 shrink-0 rounded-full border-2 bg-cover bg-center shadow-md transition hover:ring-2 hover:ring-primary ${
                                        panelOpen
                                            ? "border-primary ring-2 ring-primary/40"
                                            : "border-border ring-2 ring-transparent"
                                    }`}
                                    style={{
                                        backgroundImage: `url(${c.participantAvatarUrl ?? DEFAULT_USER_AVATAR_URL})`,
                                    }}
                                    title={
                                        c.unreadCount > 0
                                            ? `${c.participantName} — ${t("messaging.dockAvatarUnreadAria", { count: c.unreadCount })}`
                                            : c.participantName
                                    }
                                    aria-pressed={panelOpen}
                                >
                                    {c.unreadCount > 0 ? (
                                        <span
                                            className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground"
                                            aria-hidden
                                        >
                                            {c.unreadCount > 99
                                                ? "99+"
                                                : c.unreadCount}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setDockExpanded((v) => !v)}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition hover:bg-muted/60"
                    aria-expanded={dockExpanded}
                    aria-label={
                        dockExpanded
                            ? t("messaging.dockCollapse")
                            : t("messaging.dockExpand")
                    }
                >
                    {dockExpanded ? (
                        <ChevronDown className="h-6 w-6" />
                    ) : (
                        <MessageCircle className="h-6 w-6" />
                    )}
                </button>
            </div>
        </div>
    );
}
