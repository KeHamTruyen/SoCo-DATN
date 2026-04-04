import { EditorContent, useEditor } from "@tiptap/react";
import { useRef } from "react";
import { PostEditorToolbar } from "../../../shared/tiptap/PostEditorToolbar";
import { POST_EDITOR_EXTENSIONS, POST_MODAL_EDITOR_HTML_PROPS } from "../../../shared/tiptap/postEditorConfig";
import { cn } from "../../../shared/lib/cn";

interface PostBodyEditorProps {
    /** HTML khởi tạo (TipTap). Đổi khi mở modal sửa bài / lên lịch với initial khác. */
    defaultHtml: string;
    onHtmlChange: (html: string) => void;
    className?: string;
    /** Ẩn emoji / chèn ảnh URL khi modal đã có khu vực media riêng. */
    hideEmoji?: boolean;
    hideInsertImage?: boolean;
}

/**
 * Soạn thảo nội dung bài viết (TipTap) — dùng trong CreatePostModal.
 */
export function PostBodyEditor({
    defaultHtml,
    onHtmlChange,
    className,
    hideEmoji,
    hideInsertImage,
}: PostBodyEditorProps) {
    const onHtmlChangeRef = useRef(onHtmlChange);
    onHtmlChangeRef.current = onHtmlChange;

    const editor = useEditor(
        {
            immediatelyRender: true,
            shouldRerenderOnTransaction: false,
            extensions: POST_EDITOR_EXTENSIONS,
            content: defaultHtml?.trim() ? defaultHtml : "<p></p>",
            editorProps: POST_MODAL_EDITOR_HTML_PROPS,
            onUpdate: ({ editor: ed }) => {
                queueMicrotask(() => {
                    onHtmlChangeRef.current(ed.getHTML());
                });
            },
        },
        [],
    );

    const insertImageFromUrl = () => {
        if (!editor) return;
        const url = window.prompt("Dán URL ảnh (https://…)");
        if (!url?.trim()) return;
        editor.chain().focus().setImage({ src: url.trim() }).run();
    };

    if (!editor) {
        return (
            <div className="min-h-[180px] animate-pulse rounded-lg bg-neutral-200/50 dark:bg-neutral-800/50" />
        );
    }

    return (
        <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}>
            <PostEditorToolbar
                editor={editor}
                onInsertImageUrl={insertImageFromUrl}
                compact
                hideEmoji={hideEmoji}
                hideInsertImage={hideInsertImage}
            />
            <div
                className={cn(
                    "max-h-[min(62vh,560px)] min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-lg",
                    "border border-neutral-200/80 bg-white/50 dark:border-neutral-700/80 dark:bg-neutral-950/30",
                    "focus-within:ring-2 focus-within:ring-primary/15",
                )}
            >
                <EditorContent editor={editor} className="min-h-[200px] [&_.ProseMirror]:min-h-[200px]" />
            </div>
        </div>
    );
}
