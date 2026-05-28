import { Minus, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Conversation, Message } from "../types/messaging.types";
import { DEFAULT_USER_AVATAR_URL } from "../../../shared/config/defaultAssets";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";

interface DockChatPanelProps {
    conversationId: string;
    conversation: Conversation | undefined;
    messages: Message[];
    currentUserId: string;
    isSending: boolean;
    onSend: (conversationId: string, text: string) => Promise<void>;
    onAttachImage: (conversationId: string, file: File) => Promise<void>;
    onMinimize: (conversationId: string) => void;
    onClose: (conversationId: string) => void;
    onOpenInMessenger: (conversationId: string) => void;
}

/**
 * A single floating chat panel used inside the dock.
 * Contains: header bar, message list, and composer.
 */
export function DockChatPanel({
    conversationId,
    conversation,
    messages,
    currentUserId,
    isSending,
    onSend,
    onAttachImage,
    onMinimize,
    onClose,
    onOpenInMessenger,
}: DockChatPanelProps) {
    const { t } = useTranslation();
    const [input, setInput] = useState("");

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;
        setInput("");
        try {
            await onSend(conversationId, text);
        } catch {
            setInput(text);
        }
    };

    return (
        <div className="flex h-[min(420px,calc(100vh-8rem))] w-[min(340px,calc(100vw-2rem))] flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-xl">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                    {conversation?.participantId ? (
                        <Link
                            to={`/profile/${conversation.participantId}`}
                            className="h-8 w-8 shrink-0 rounded-full bg-cover bg-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            style={{
                                backgroundImage: `url(${conversation.participantAvatarUrl ?? DEFAULT_USER_AVATAR_URL})`,
                            }}
                            aria-label={`View profile of ${conversation.participantName}`}
                        />
                    ) : (
                        <div
                            className="h-8 w-8 shrink-0 rounded-full bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${DEFAULT_USER_AVATAR_URL})`,
                            }}
                        />
                    )}
                    <span className="truncate text-sm font-semibold text-foreground">
                        {conversation?.participantName ??
                            t("messaging.loadingConversation")}
                    </span>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                    <Link
                        to="/messages"
                        className="rounded px-2 py-1 text-[10px] font-medium text-primary hover:bg-muted/60"
                        onClick={() => onOpenInMessenger(conversationId)}
                    >
                        {t("messaging.dockOpenMessenger")}
                    </Link>
                    <button
                        type="button"
                        className="group rounded-md p-1.5 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
                        onClick={() => onMinimize(conversationId)}
                        aria-label={t("messaging.dockMinimize")}
                    >
                        <Minus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </button>
                    <button
                        type="button"
                        className="group rounded-md p-1.5 text-muted-foreground transition-all duration-200 hover:bg-destructive/15 hover:text-destructive active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/45"
                        onClick={() => onClose(conversationId)}
                        aria-label={t("messaging.dockClose")}
                    >
                        <X className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-90" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <MessageList messages={messages} currentUserId={currentUserId} />
            </div>

            {/* Composer */}
            <MessageComposer
                value={input}
                onChange={setInput}
                onSend={() => void handleSend()}
                onAttachImage={(file) =>
                    void onAttachImage(conversationId, file)
                }
                disabled={isSending}
                sending={isSending}
            />
        </div>
    );
}
