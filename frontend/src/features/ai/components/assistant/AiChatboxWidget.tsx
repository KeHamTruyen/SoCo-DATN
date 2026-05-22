import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Minus, Send, Sparkles, X } from "lucide-react";
import { useAuthSession } from "../../../../shared/auth/useAuthSession";
import { Button } from "../../../../shared/ui";
import { cartApi } from "../../../cart/api/cartApi";
import {
    assistantApi,
    type AssistantHistoryItem,
    type AssistantMemory,
    type AssistantProductCard,
    type AssistantQuickAction,
} from "../../api/assistantApi";

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    quickActions?: AssistantQuickAction[];
    products?: AssistantProductCard[];
    followUps?: string[];
};

function statusLabel(stock: number | null): string {
    if (stock == null) return "Có sẵn";
    if (stock <= 0) return "Hết hàng";
    if (stock <= 5) return `Sắp hết (${stock})`;
    return `Còn hàng (${stock})`;
}

function toHistory(messages: ChatMessage[]): AssistantHistoryItem[] {
    return messages
        .map((message) => ({
            role: message.role,
            content: message.content,
        }))
        .slice(-8);
}

export function AiChatboxWidget() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthSession();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [memory, setMemory] = useState<AssistantMemory>({});
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "init",
            role: "assistant",
            content:
                "Xin chào. Mình là trợ lý mua sắm AI. Bạn có thể hỏi giá, tồn kho, so sánh sản phẩm hoặc tra cứu đơn hàng.",
            followUps: ["Gợi ý điện thoại tầm 5 triệu", "Đơn ORD123... của tôi đang ở đâu?"],
        },
    ]);

    const canSend = useMemo(
        () => isAuthenticated && !isLoading && input.trim().length > 0,
        [input, isAuthenticated, isLoading],
    );

    const appendAssistantError = (message: string) => {
        setMessages((prev) => [
            ...prev,
            {
                id: `assistant-error-${Date.now()}`,
                role: "assistant",
                content: message,
            },
        ]);
    };

    const handleQuickAction = async (action: AssistantQuickAction) => {
        if (action.type === "add_to_cart" && action.productId) {
            try {
                await cartApi.addItem(action.productId, 1);
                appendAssistantError("Đã thêm sản phẩm vào giỏ hàng.");
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Không thể thêm vào giỏ lúc này.";
                appendAssistantError(message);
            }
            return;
        }

        if (action.route) {
            navigate(action.route);
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const userText = input.trim();
        if (!userText || !isAuthenticated || isLoading) return;

        const nextMessages: ChatMessage[] = [
            ...messages,
            {
                id: `user-${Date.now()}`,
                role: "user",
                content: userText,
            },
        ];

        setMessages(nextMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await assistantApi.chat({
                message: userText,
                history: toHistory(nextMessages),
                memory,
            });

            setMemory(response.memory || {});
            setMessages((prev) => [
                ...prev,
                {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: response.reply,
                    quickActions: response.quickActions,
                    products: response.cards?.products,
                    followUps: response.followUps,
                },
            ]);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể nhận phản hồi từ AI lúc này.";
            appendAssistantError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-20 z-40 flex max-w-[100vw] flex-row items-end gap-3 pl-2">
            {open ? (
                <section className="flex h-[min(420px,calc(100vh-8rem))] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-xl">
                    <header className="flex shrink-0 items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Sparkles className="h-4 w-4" />
                            </span>
                            <span className="truncate text-sm font-semibold text-foreground">
                                AI Shopping Assistant
                            </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                            <button
                                type="button"
                                className="group rounded-md p-1.5 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
                                onClick={() => setOpen(false)}
                                aria-label="Thu gọn AI chat"
                            >
                                <Minus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            </button>
                            <button
                                type="button"
                                className="group rounded-md p-1.5 text-muted-foreground transition-all duration-200 hover:bg-destructive/15 hover:text-destructive active:scale-95"
                                onClick={() => setOpen(false)}
                                aria-label="Đóng AI chat"
                            >
                                <X className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-90" />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 px-3 py-3">
                        {!isAuthenticated && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                                Vui lòng đăng nhập để dùng trợ lý AI mua sắm.
                                <div className="mt-2">
                                    <Button size="sm" onClick={() => navigate("/login")}>Đăng nhập</Button>
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <article
                                key={message.id}
                                className={`max-w-[92%] rounded-xl px-3 py-2 text-sm ${
                                    message.role === "user"
                                        ? "ml-auto bg-primary text-primary-foreground"
                                        : "mr-auto border border-border bg-background text-foreground"
                                }`}
                            >
                                <p className="whitespace-pre-wrap">{message.content}</p>

                                {message.products && message.products.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {message.products.slice(0, 3).map((product) => (
                                            <div
                                                key={product.id}
                                                className="rounded-lg border border-border bg-card p-2 text-xs text-card-foreground"
                                            >
                                                <div className="font-semibold">{product.title}</div>
                                                <div className="mt-1 text-muted-foreground">
                                                    {product.priceText} • {statusLabel(product.stockQuantity)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {message.quickActions && message.quickActions.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {message.quickActions.map((action, index) => (
                                            <Button
                                                key={`${message.id}-${action.type}-${index}`}
                                                size="sm"
                                                variant="outline"
                                                className="h-8 rounded-full px-3 text-xs"
                                                onClick={() => void handleQuickAction(action)}
                                            >
                                                {action.label}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                {message.followUps && message.followUps.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {message.followUps.map((text) => (
                                            <button
                                                type="button"
                                                key={`${message.id}-${text}`}
                                                onClick={() => setInput(text)}
                                                className="rounded-full border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                                            >
                                                {text}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </article>
                        ))}

                        {isLoading && (
                            <div className="mr-auto rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                                Trợ lý đang xử lý...
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-border bg-background p-3">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="Hỏi giá, tồn kho, so sánh, đơn hàng..."
                                className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
                            />
                            <Button
                                type="submit"
                                disabled={!canSend}
                                size="sm"
                                className="h-10 w-10 px-0"
                                aria-label="Gửi"
                                title="Gửi"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </section>
            ) : null}

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition hover:bg-muted/60 ${
                    open ? "ring-2 ring-primary/45" : ""
                }`}
                aria-expanded={open}
                aria-label={open ? "Thu gọn AI chat" : "Mở AI chat"}
            >
                <MessageCircle className="h-6 w-6" />
            </button>
        </div>
    );
}
