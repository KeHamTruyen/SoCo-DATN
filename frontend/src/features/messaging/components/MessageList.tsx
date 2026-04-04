import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Message } from "../types/messaging.types";
import { cn } from "../../../shared/lib/cn";

interface MessageListProps {
    messages: Message[];
    currentUserId: string | undefined;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
    const { t } = useTranslation();
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center py-12 text-center text-sm text-muted-foreground">
                {t("messaging.emptyThread")}
            </div>
        );
    }

    return (
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col justify-end space-y-1.5 overflow-y-auto p-3">
            {messages.map((msg) => {
                const isSent = msg.senderId === currentUserId;
                return (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex max-w-[80%]",
                            isSent ? "ml-auto" : "",
                        )}
                    >
                        <div
                            className={cn(
                                "rounded-xl px-3 py-1.5",
                                isSent
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border bg-card text-card-foreground",
                            )}
                        >
                            {msg.type === "image" ? (
                                <div className="max-w-full space-y-1">
                                    {msg.mediaUrl ? (
                                        <a
                                            href={msg.mediaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block overflow-hidden rounded-lg"
                                        >
                                            <img
                                                src={msg.mediaUrl}
                                                alt=""
                                                className="max-h-48 w-full object-contain"
                                            />
                                        </a>
                                    ) : null}
                                    {msg.content ? (
                                        <p className="text-sm">{msg.content}</p>
                                    ) : null}
                                </div>
                            ) : msg.type === "product" && msg.product ? (
                                <div className="w-60 max-w-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
                                    {msg.product.imageUrl && (
                                        <div
                                            className="aspect-video bg-cover bg-center"
                                            style={{
                                                backgroundImage: `url(${msg.product.imageUrl})`,
                                            }}
                                        />
                                    )}
                                    <div className="p-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-sm font-bold">
                                                {msg.product.name}
                                            </h4>
                                            <span className="shrink-0 text-sm font-bold text-primary">
                                                ${msg.product.price.toFixed(2)}
                                            </span>
                                        </div>
                                        {msg.product.description && (
                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                {msg.product.description}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            className="mt-2 w-full rounded-lg bg-primary/10 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                                        >
                                            {t("messaging.viewProduct")}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm">{msg.content}</p>
                            )}
                            <span
                                className={cn(
                                    "mt-0.5 block text-[10px]",
                                    isSent
                                        ? "text-right text-primary-foreground/70"
                                        : "text-muted-foreground",
                                )}
                            >
                                {new Date(msg.createdAt).toLocaleTimeString(
                                    undefined,
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    },
                                )}
                            </span>
                        </div>
                    </div>
                );
            })}
            <div ref={endRef} />
        </div>
    );
}
