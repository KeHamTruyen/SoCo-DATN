import type { Editor } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    Bold,
    Image as ImageIcon,
    Italic,
    List,
    ListOrdered,
    Redo2,
    Smile,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo2,
} from "lucide-react";
import { memo, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../shared/lib/cn";

const EMOJI_PRESETS = ["😊", "🎉", "😍", "👍", "✨", "🔥", "💯", "🙌"];

/** Một lần khởi tạo — tránh TipTap gọi setOptions mỗi render. */
const AI_LAB_EXTENSIONS = [
    StarterKit.configure({
        heading: { levels: [2, 3] },
    }),
    Underline,
    Placeholder.configure({
        placeholder:
            "Soạn bài đăng tại đây — có thể dùng AI bên trái để gợi ý nội dung.",
    }),
    Image.configure({
        inline: false,
        allowBase64: true,
    }),
];

const PROSEMIRROR_INNER_CLASS =
    "min-h-[200px] w-full max-w-none px-1 py-2 text-base leading-relaxed outline-none " +
    "text-neutral-900 dark:text-neutral-100 " +
    "[&_p]:my-2 [&_p:first-child]:mt-0 " +
    "[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:tracking-tight " +
    "[&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-lg [&_h3]:font-bold " +
    "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 " +
    "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 " +
    "[&_img]:max-h-48 [&_img]:rounded-lg [&_img]:border [&_img]:border-neutral-200 [&_img]:dark:border-neutral-700";

const AI_LAB_EDITOR_PROPS = {
    attributes: {
        class: PROSEMIRROR_INNER_CLASS,
    },
} as const;

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function buildGeneratedPostHtml(
    generated: unknown,
    opts: { withHashtags: boolean; withCta: boolean; length: string },
): string {
    const gt = (generated as { generatedText?: Record<string, unknown> } | null)?.generatedText;
    if (!gt) return "<p></p>";
    const hashtagMax = opts.length === "Short" ? 5 : opts.length === "Medium" ? 8 : 10;
    const parts: string[] = [];
    if (gt.title) parts.push(`<h2>${escapeHtml(String(gt.title))}</h2>`);
    if (gt.body) {
        const bodyEscaped = escapeHtml(String(gt.body)).replace(/\n/g, "<br/>");
        parts.push(`<p>${bodyEscaped}</p>`);
    }
    if (opts.withCta && gt.callToAction) {
        parts.push(`<p><strong>${escapeHtml(String(gt.callToAction))}</strong></p>`);
    }
    if (opts.withHashtags && Array.isArray(gt.hashtags) && gt.hashtags.length) {
        const tags = (gt.hashtags as string[]).slice(0, hashtagMax).join(" ");
        parts.push(`<p><em>${escapeHtml(tags)}</em></p>`);
    }
    return parts.join("") || "<p></p>";
}

type LengthOpt = "Short" | "Medium" | "Long";

interface AiLabRichOutputProps {
    generated: unknown | null;
    outputRevision: number;
    editorResetNonce: number;
    withHashtags: boolean;
    withCta: boolean;
    length: LengthOpt;
    /** Gọi khi nội dung plain text đổi — parent nên lưu ref, không setState mỗi ký tự. */
    onPlainTextChange: (plain: string) => void;
}

const AiLabToolbar = memo(function AiLabToolbar({
    editor,
    onInsertImageUrl,
}: {
    editor: Editor;
    onInsertImageUrl: () => void;
}) {
    const [emojiOpen, setEmojiOpen] = useState(false);
    const emojiRef = useRef<HTMLDivElement>(null);

    const t = useEditorState({
        editor,
        selector: ({ editor: ed }) => ({
            bold: ed.isActive("bold"),
            italic: ed.isActive("italic"),
            underline: ed.isActive("underline"),
            strike: ed.isActive("strike"),
            bulletList: ed.isActive("bulletList"),
            orderedList: ed.isActive("orderedList"),
            canUndo: ed.can().undo(),
            canRedo: ed.can().redo(),
        }),
    });

    useEffect(() => {
        if (!emojiOpen) return;
        const close = (e: MouseEvent) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
                setEmojiOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [emojiOpen]);

    return (
        <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-neutral-200 pb-3 dark:border-neutral-700">
            <ToolbarIcon
                label="Đậm"
                active={t.bold}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </ToolbarIcon>
            <ToolbarIcon
                label="Nghiêng"
                active={t.italic}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </ToolbarIcon>
            <ToolbarIcon
                label="Gạch chân"
                active={t.underline}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <UnderlineIcon className="h-4 w-4" />
            </ToolbarIcon>
            <ToolbarIcon
                label="Gạch ngang"
                active={t.strike}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-4 w-4" />
            </ToolbarIcon>
            <span className="mx-1 hidden h-4 w-px bg-neutral-200 sm:inline-block dark:bg-neutral-700" />
            <ToolbarIcon
                label="Danh sách bullet"
                active={t.bulletList}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
            </ToolbarIcon>
            <ToolbarIcon
                label="Danh sách số"
                active={t.orderedList}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
            </ToolbarIcon>
            <span className="mx-1 hidden h-4 w-px bg-neutral-200 sm:inline-block dark:bg-neutral-700" />
            <ToolbarIcon
                label="Hoàn tác"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!t.canUndo}
            >
                <Undo2 className="h-4 w-4" />
            </ToolbarIcon>
            <ToolbarIcon
                label="Làm lại"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!t.canRedo}
            >
                <Redo2 className="h-4 w-4" />
            </ToolbarIcon>
            <span className="mx-1 hidden h-4 w-px bg-neutral-200 sm:inline-block dark:bg-neutral-700" />
            <div className="relative" ref={emojiRef}>
                <ToolbarIcon
                    label="Chèn emoji"
                    active={emojiOpen}
                    onClick={() => setEmojiOpen((o) => !o)}
                >
                    <Smile className="h-4 w-4" />
                </ToolbarIcon>
                {emojiOpen ? (
                    <div className="absolute left-0 top-full z-20 mt-1 flex flex-wrap gap-1 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                        {EMOJI_PRESETS.map((em) => (
                            <button
                                key={em}
                                type="button"
                                className="rounded p-1.5 text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                onClick={() => {
                                    editor.chain().focus().insertContent(em).run();
                                    setEmojiOpen(false);
                                }}
                            >
                                {em}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
            <ToolbarIcon label="Chèn ảnh từ URL" onClick={onInsertImageUrl}>
                <ImageIcon className="h-4 w-4" />
            </ToolbarIcon>
        </div>
    );
});

export function AiLabRichOutput({
    generated,
    outputRevision,
    editorResetNonce,
    withHashtags,
    withCta,
    length,
    onPlainTextChange,
}: AiLabRichOutputProps) {
    const onPlainTextChangeRef = useRef(onPlainTextChange);
    onPlainTextChangeRef.current = onPlainTextChange;

    const editor = useEditor(
        {
            immediatelyRender: true,
            shouldRerenderOnTransaction: false,
            extensions: AI_LAB_EXTENSIONS,
            content: "<p></p>",
            editorProps: AI_LAB_EDITOR_PROPS,
            onUpdate: ({ editor: ed }) => {
                const plain = ed.getText({ blockSeparator: "\n\n" });
                queueMicrotask(() => {
                    onPlainTextChangeRef.current(plain);
                });
            },
        },
        [],
    );

    useEffect(() => {
        if (!editor || editorResetNonce === 0) return;
        editor.commands.setContent("<p></p>", { emitUpdate: true });
        onPlainTextChangeRef.current("");
    }, [editor, editorResetNonce]);

    useEffect(() => {
        if (!editor || outputRevision === 0) return;
        if (!generated) {
            editor.commands.setContent("<p></p>", { emitUpdate: true });
            onPlainTextChangeRef.current("");
            return;
        }
        const html = buildGeneratedPostHtml(generated, { withHashtags, withCta, length });
        editor.commands.setContent(html, { emitUpdate: true });
        onPlainTextChangeRef.current(editor.getText({ blockSeparator: "\n\n" }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, outputRevision]);

    const insertImageFromUrl = useCallback(() => {
        if (!editor) return;
        const url = window.prompt("Dán URL ảnh (https://…)");
        if (!url?.trim()) return;
        editor.chain().focus().setImage({ src: url.trim() }).run();
    }, [editor]);

    if (!editor) {
        return (
            <div className="min-h-[220px] animate-pulse rounded-lg bg-neutral-200/50 dark:bg-neutral-800/50" />
        );
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <AiLabToolbar editor={editor} onInsertImageUrl={insertImageFromUrl} />
            <div
                className={cn(
                    "min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-lg",
                    "border border-neutral-200/80 bg-white/50 dark:border-neutral-700/80 dark:bg-neutral-950/30",
                    "focus-within:ring-2 focus-within:ring-primary/20",
                )}
            >
                <EditorContent editor={editor} className="h-full min-h-[220px] [&_.ProseMirror]:min-h-[200px]" />
            </div>
        </div>
    );
}

function ToolbarIcon({
    children,
    label,
    active,
    disabled,
    onClick,
}: {
    children: ReactNode;
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            disabled={disabled}
            onMouseDown={(e) => {
                // Giữ focus trong editor khi bấm nút định dạng (tránh mất selection).
                e.preventDefault();
            }}
            onClick={onClick}
            className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-600 transition-colors",
                "hover:bg-neutral-200/90 dark:text-neutral-400 dark:hover:bg-neutral-800",
                active && "bg-neutral-200 text-primary dark:bg-neutral-800 dark:text-primary",
                disabled && "pointer-events-none opacity-40",
            )}
        >
            {children}
        </button>
    );
}
