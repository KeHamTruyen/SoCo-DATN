import { Image, MoreVertical, Paperclip, Search, Send, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { messagingApi } from "../features/messaging/api/messagingApi";
import type { Conversation, Message } from "../features/messaging/types/messaging.types";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { cn } from "../shared/lib/cn";
import { UnifiedHeader } from "../shared/ui";

export default function Messages() {
    const { user } = useAuthSession();
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        void (async () => {
            setIsLoading(true);
            try {
                const data = await messagingApi.listConversations();
                setConversations(data.items);
                if (data.items.length > 0) {
                    setActiveConversationId(data.items[0].id);
                }
            } catch {
                setConversations([]);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!activeConversationId) return;
        let mounted = true;
        void (async () => {
            try {
                const data = await messagingApi.listMessages(activeConversationId);
                if (!mounted) return;
                setMessages(data.items);
            } catch {
                if (!mounted) return;
                setMessages([]);
            }
        })();
        return () => { mounted = false; };
    }, [activeConversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const activeConversation = conversations.find((c) => c.id === activeConversationId);

    const handleSend = async () => {
        const trimmed = messageInput.trim();
        if (!trimmed || !activeConversationId) return;
        setIsSending(true);
        setMessageInput("");
        try {
            const msg = await messagingApi.sendMessage(activeConversationId, trimmed);
            setMessages((prev) => [...prev, msg]);
        } catch {
            setMessageInput(trimmed);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
            />
            <div className="mx-auto flex w-full max-w-[1440px] flex-1 overflow-hidden">
                <div
                    className="flex h-[calc(100vh-64px)] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800"
                    style={{ margin: "1rem" }}
                >
                    <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="p-4">
                            <h1 className="mb-4 text-xl font-bold">Messages</h1>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search chats"
                                    className="w-full rounded-lg border-none bg-slate-100 py-2 pl-10 text-sm focus:ring-1 focus:ring-primary/50 dark:bg-slate-800"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="space-y-3 p-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                                                <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="p-6 text-center text-sm text-slate-400">
                                    No conversations yet.
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        type="button"
                                        onClick={() => setActiveConversationId(conv.id)}
                                        className={cn(
                                            "flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left transition-colors",
                                            activeConversationId === conv.id
                                                ? "border-r-4 border-primary bg-primary/5"
                                                : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                        )}
                                    >
                                        <div className="relative shrink-0">
                                            <div
                                                className="h-12 w-12 rounded-full bg-slate-200 bg-cover bg-center dark:bg-slate-700"
                                                style={
                                                    conv.participantAvatarUrl
                                                        ? { backgroundImage: `url(${conv.participantAvatarUrl})` }
                                                        : undefined
                                                }
                                            />
                                            {conv.isOnline && (
                                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <h3
                                                    className={cn(
                                                        "truncate text-sm",
                                                        activeConversationId === conv.id
                                                            ? "font-bold"
                                                            : "font-semibold",
                                                    )}
                                                >
                                                    {conv.participantName}
                                                </h3>
                                                <span
                                                    className={cn(
                                                        "text-[10px]",
                                                        activeConversationId === conv.id
                                                            ? "font-medium text-primary"
                                                            : "text-slate-400",
                                                    )}
                                                >
                                                    {conv.lastMessageAt
                                                        ? new Date(conv.lastMessageAt).toLocaleTimeString(
                                                              "en-US",
                                                              { hour: "2-digit", minute: "2-digit" },
                                                          )
                                                        : ""}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="truncate text-xs text-slate-400">
                                                    {conv.lastMessage}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>

                    <section className="flex flex-1 flex-col bg-slate-50 dark:bg-background-dark">
                        {activeConversation ? (
                            <>
                                <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center dark:bg-slate-700"
                                            style={
                                                activeConversation.participantAvatarUrl
                                                    ? {
                                                          backgroundImage: `url(${activeConversation.participantAvatarUrl})`,
                                                      }
                                                    : undefined
                                            }
                                        />
                                        <div>
                                            <h2 className="text-sm font-bold">
                                                {activeConversation.participantName}
                                            </h2>
                                            <p
                                                className={cn(
                                                    "text-[10px] font-medium",
                                                    activeConversation.isOnline
                                                        ? "text-green-500"
                                                        : "text-slate-400",
                                                )}
                                            >
                                                {activeConversation.isOnline ? "Online" : "Offline"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            type="button"
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
                                    {messages.length === 0 ? (
                                        <div className="py-12 text-center text-sm text-slate-400">
                                            No messages yet. Say hello!
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isSent = msg.senderId === user?.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={cn(
                                                        "flex max-w-[80%] items-start gap-3",
                                                        isSent ? "ml-auto flex-row-reverse" : "",
                                                    )}
                                                >
                                                    {!isSent && (
                                                        <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
                                                    )}
                                                    <div
                                                        className={cn(
                                                            "rounded-2xl p-4 shadow-sm",
                                                            isSent
                                                                ? "bg-primary text-white"
                                                                : "bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100",
                                                        )}
                                                    >
                                                        {msg.type === "product" && msg.product ? (
                                                            <div className="w-72 overflow-hidden rounded-xl border border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-900">
                                                                {msg.product.imageUrl && (
                                                                    <div
                                                                        className="aspect-video bg-cover bg-center"
                                                                        style={{
                                                                            backgroundImage: `url(${msg.product.imageUrl})`,
                                                                        }}
                                                                    />
                                                                )}
                                                                <div className="p-3">
                                                                    <div className="flex items-start justify-between">
                                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                                            {msg.product.name}
                                                                        </h4>
                                                                        <span className="text-sm font-bold text-primary">
                                                                            ${msg.product.price}
                                                                        </span>
                                                                    </div>
                                                                    {msg.product.description && (
                                                                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                                                            {msg.product.description}
                                                                        </p>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        className="mt-3 w-full rounded-lg bg-primary/10 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                                                                    >
                                                                        View Product Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm">{msg.content}</p>
                                                        )}
                                                        <span
                                                            className={cn(
                                                                "mt-1 block text-[10px]",
                                                                isSent ? "text-right text-orange-100/70" : "text-slate-400",
                                                            )}
                                                        >
                                                            {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Image className="h-4 w-4" />
                                            </button>
                                            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Tag className="h-4 w-4" />
                                            </button>
                                            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Paperclip className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    void handleSend();
                                                }
                                            }}
                                            placeholder="Type a message..."
                                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => void handleSend()}
                                            disabled={!messageInput.trim() || isSending}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center text-slate-400">
                                Select a conversation to start chatting
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
