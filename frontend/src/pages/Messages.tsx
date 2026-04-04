import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { ChatHeader } from "../features/messaging/components/ChatHeader";
import { ConversationSidebar } from "../features/messaging/components/ConversationSidebar";
import { MessageComposer } from "../features/messaging/components/MessageComposer";
import { MessageList } from "../features/messaging/components/MessageList";
import { uploadApi } from "../features/upload/api/uploadApi";
import { useMessaging } from "../features/messaging/context/MessagingContext";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { PageShell, UnifiedHeader } from "../shared/ui";

export default function Messages() {
    const { t } = useTranslation();
    const { user } = useAuthSession();
    const [searchParams, setSearchParams] = useSearchParams();
    const userIdParam = searchParams.get("userId");

    const {
        conversations,
        messageThreads,
        isLoadingConversations,
        loadMessagesForConversation,
        sendMessage,
        markConversationRead,
        startConversationWithUser,
        setActiveConversationId,
        refreshConversations,
    } = useMessaging();

    const [activeConversationId, setActiveId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [openingUser, setOpeningUser] = useState(false);

    const activeConversation = conversations.find((c) => c.id === activeConversationId);
    const messages = activeConversationId ? messageThreads[activeConversationId] ?? [] : [];

    useEffect(() => {
        setActiveConversationId(activeConversationId);
        return () => setActiveConversationId(null);
    }, [activeConversationId, setActiveConversationId]);

    /** Load thread when active conversation changes */
    useEffect(() => {
        if (!activeConversationId) return;
        void loadMessagesForConversation(activeConversationId);
    }, [activeConversationId, loadMessagesForConversation]);

    /** Mark read when viewing a thread */
    useEffect(() => {
        if (!activeConversationId) return;
        void markConversationRead(activeConversationId);
    }, [activeConversationId, markConversationRead]);

    /** Deep link: /messages?userId= */
    useEffect(() => {
        if (!userIdParam || !user?.id || userIdParam === user.id) {
            return;
        }

        let cancelled = false;
        setOpeningUser(true);
        void (async () => {
            try {
                const cid = await startConversationWithUser(userIdParam);
                if (cancelled) return;
                setActiveId(cid);
                setSearchParams(
                    (prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete("userId");
                        return next;
                    },
                    { replace: true },
                );
            } catch {
                if (!cancelled) {
                    setSearchParams(
                        (prev) => {
                            const next = new URLSearchParams(prev);
                            next.delete("userId");
                            return next;
                        },
                        { replace: true },
                    );
                }
            } finally {
                if (!cancelled) setOpeningUser(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [userIdParam, user?.id, startConversationWithUser, setSearchParams]);

    const handleSelectConversation = useCallback((conversationId: string) => {
        setActiveId(conversationId);
    }, []);

    const handleSend = useCallback(async () => {
        const trimmed = messageInput.trim();
        if (!trimmed || !activeConversationId) return;
        setIsSending(true);
        setMessageInput("");
        try {
            await sendMessage(activeConversationId, trimmed);
        } catch {
            setMessageInput(trimmed);
        } finally {
            setIsSending(false);
        }
    }, [messageInput, activeConversationId, sendMessage]);

    const handleAttachImage = useCallback(
        async (file: File) => {
            if (!activeConversationId) return;
            setIsSending(true);
            try {
                const { url } = await uploadApi.uploadPostMedia(file);
                await sendMessage(activeConversationId, { messageType: "IMAGE", mediaUrl: url });
            } finally {
                setIsSending(false);
            }
        },
        [activeConversationId, sendMessage],
    );

    /** Select first conversation when list loads (no deep link in progress) */
    useEffect(() => {
        if (userIdParam || openingUser) return;
        if (conversations.length === 0 || activeConversationId) return;
        setActiveId(conversations[0].id);
    }, [conversations, activeConversationId, userIdParam, openingUser]);

    return (
        <PageShell className="flex min-h-screen flex-col bg-background text-foreground">
            <UnifiedHeader
                navItems={[
                    { label: t("messaging.navFeed"), to: "/feed" },
                    { label: t("messaging.navMarketplace"), to: "/marketplace" },
                ]}
            />
            <div className="mx-auto flex w-full max-w-[1440px] flex-1 overflow-hidden">
                <div
                    className="m-4 flex h-[calc(100vh-64px)] w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                    role="main"
                >
                    <ConversationSidebar
                        conversations={conversations}
                        activeConversationId={activeConversationId}
                        isLoading={isLoadingConversations || openingUser}
                        onSelect={handleSelectConversation}
                    />

                    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted/30">
                        {activeConversation ? (
                            <>
                                <ChatHeader conversation={activeConversation} />
                                <MessageList messages={messages} currentUserId={user?.id} />
                                <MessageComposer
                                    value={messageInput}
                                    onChange={setMessageInput}
                                    onSend={() => void handleSend()}
                                    onAttachImage={handleAttachImage}
                                    disabled={isSending}
                                    sending={isSending}
                                />
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground">
                                <p>{t("messaging.selectConversation")}</p>
                                <button
                                    type="button"
                                    className="text-sm font-medium text-primary hover:underline"
                                    onClick={() => void refreshConversations()}
                                >
                                    {t("messaging.refreshList")}
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </PageShell>
    );
}
