import { useEffect, useRef, useState } from "react";
import { ImagePlus, Send, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";

const QUICK_EMOJIS = [
    "😀",
    "😂",
    "🥰",
    "😍",
    "👍",
    "👏",
    "❤️",
    "🔥",
    "✨",
    "🙏",
    "😊",
    "🎉",
    "💬",
    "👋",
    "🤝",
];

interface MessageComposerProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    /** Upload + send image message (optional). */
    onAttachImage?: (file: File) => void | Promise<void>;
    disabled?: boolean;
    sending?: boolean;
}

export function MessageComposer({
    value,
    onChange,
    onSend,
    onAttachImage,
    disabled,
    sending,
}: MessageComposerProps) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiWrapRef = useRef<HTMLDivElement>(null);
    const [emojiOpen, setEmojiOpen] = useState(false);

    useEffect(() => {
        if (!emojiOpen) return;
        const onDocDown = (e: MouseEvent) => {
            const el = emojiWrapRef.current;
            if (el && !el.contains(e.target as Node)) setEmojiOpen(false);
        };
        document.addEventListener("mousedown", onDocDown);
        return () => document.removeEventListener("mousedown", onDocDown);
    }, [emojiOpen]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !onAttachImage) return;
        await onAttachImage(file);
    };

    const appendEmoji = (ch: string) => {
        onChange(value + ch);
        setEmojiOpen(false);
    };

    const busy = Boolean(disabled || sending);

    return (
        <div className="shrink-0 border-t border-border bg-card p-2">
            <div className="flex min-w-0 items-center gap-2">
                <div
                    ref={emojiWrapRef}
                    className="relative flex shrink-0 items-center gap-0.5"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        tabIndex={-1}
                        onChange={(e) => void handleFileChange(e)}
                    />
                    <button
                        type="button"
                        disabled={busy || !onAttachImage}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                        aria-label={t("messaging.attachImage")}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImagePlus className="h-5 w-5" strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        disabled={busy}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40 ${emojiOpen ? "bg-muted/60 text-foreground" : ""}`}
                        aria-label={t("messaging.attachEmoji")}
                        aria-expanded={emojiOpen}
                        onClick={() => setEmojiOpen((v) => !v)}
                    >
                        <Smile className="h-5 w-5" strokeWidth={2} />
                    </button>
                    {emojiOpen ? (
                        <div
                            className="absolute bottom-full left-0 z-20 mb-1.5 flex w-[220px] flex-wrap gap-1 rounded-xl border border-border bg-popover p-2 shadow-lg"
                            role="listbox"
                            aria-label={t("messaging.attachEmoji")}
                        >
                            {QUICK_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    role="option"
                                    className="flex h-9 w-9 items-center justify-center rounded-md text-lg transition-transform hover:scale-110 hover:bg-muted active:scale-95"
                                    onClick={() => appendEmoji(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                        }
                    }}
                    placeholder={t("messaging.typeMessage")}
                    disabled={busy}
                    className="min-w-0 flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                    type="button"
                    onClick={onSend}
                    disabled={!value.trim() || busy}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:opacity-50"
                    aria-label={t("messaging.send")}
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
