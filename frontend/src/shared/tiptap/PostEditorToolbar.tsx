import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
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
import { memo, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

const EMOJI_PRESETS = ["😊", "🎉", "😍", "👍", "✨", "🔥", "💯", "🙌"];

export const PostEditorToolbar = memo(function PostEditorToolbar({
    editor,
    onInsertImageUrl,
    compact,
    hideEmoji,
    hideInsertImage,
}: {
    editor: Editor;
    onInsertImageUrl: () => void;
    /** Toolbar nhỏ hơn trong modal. */
    compact?: boolean;
    /** Ẩn khi modal đã có khu vực thêm ảnh/video riêng. */
    hideEmoji?: boolean;
    hideInsertImage?: boolean;
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

    const btn = compact ? "h-8 w-8" : "h-9 w-9";

    return (
        <div
            className={cn(
                "flex flex-wrap items-center gap-0.5 border-b border-neutral-200 pb-2 dark:border-neutral-700",
                compact ? "mb-2" : "mb-3",
            )}
        >
            <ToolbarIcon className={btn} label="Đậm" active={t.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
                <Bold className="h-4 w-4" />
            </ToolbarIcon>
            <ToolbarIcon
                className={btn}
                label="Nghiêng"
                active={t.italic}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </ToolbarIcon>
            <ToolbarIcon
                className={btn}
                label="Gạch chân"
                active={t.underline}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <UnderlineIcon className="h-4 w-4" />
            </ToolbarIcon>
            <ToolbarIcon
                className={btn}
                label="Gạch ngang"
                active={t.strike}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-4 w-4" />
            </ToolbarIcon>
            <span className="mx-0.5 hidden h-4 w-px bg-neutral-200 sm:inline-block dark:bg-neutral-700" />
            <ToolbarIcon
                className={btn}
                label="Danh sách bullet"
                active={t.bulletList}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
            </ToolbarIcon>
            <ToolbarIcon
                className={btn}
                label="Danh sách số"
                active={t.orderedList}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
            </ToolbarIcon>
            <span className="mx-0.5 hidden h-4 w-px bg-neutral-200 sm:inline-block dark:bg-neutral-700" />
            <ToolbarIcon className={btn} label="Hoàn tác" onClick={() => editor.chain().focus().undo().run()} disabled={!t.canUndo}>
                <Undo2 className="h-4 w-4" />
            </ToolbarIcon>
            <ToolbarIcon className={btn} label="Làm lại" onClick={() => editor.chain().focus().redo().run()} disabled={!t.canRedo}>
                <Redo2 className="h-4 w-4" />
            </ToolbarIcon>
            {!hideEmoji || !hideInsertImage ? (
                <>
                    <span className="mx-0.5 hidden h-4 w-px bg-neutral-200 sm:inline-block dark:bg-neutral-700" />
                    {!hideEmoji ? (
                        <div className="relative" ref={emojiRef}>
                            <ToolbarIcon
                                className={btn}
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
                    ) : null}
                    {!hideInsertImage ? (
                        <ToolbarIcon className={btn} label="Chèn ảnh từ URL" onClick={onInsertImageUrl}>
                            <ImageIcon className="h-4 w-4" />
                        </ToolbarIcon>
                    ) : null}
                </>
            ) : null}
        </div>
    );
});

function ToolbarIcon({
    children,
    label,
    active,
    disabled,
    onClick,
    className,
}: {
    children: ReactNode;
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn(
                "flex shrink-0 items-center justify-center rounded-md text-neutral-600 transition-colors",
                "hover:bg-neutral-200/90 dark:text-neutral-400 dark:hover:bg-neutral-800",
                active && "bg-neutral-200 text-primary dark:bg-neutral-800 dark:text-primary",
                disabled && "pointer-events-none opacity-40",
                className,
            )}
        >
            {children}
        </button>
    );
}
