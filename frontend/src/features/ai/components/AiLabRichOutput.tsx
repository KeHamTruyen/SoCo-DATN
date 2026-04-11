import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PostEditorToolbar } from "../../../shared/tiptap/PostEditorToolbar";
import {
    createPostEditorExtensions,
    POST_EDITOR_HTML_PROPS,
} from "../../../shared/tiptap/postEditorConfig";
import { cn } from "../../../shared/lib/cn";

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
    /** HTML TipTap — dùng khi đăng bài để giữ định dạng giống CreatePostModal. */
    onHtmlChange?: (html: string) => void;
}

export function AiLabRichOutput({
    generated,
    outputRevision,
    editorResetNonce,
    withHashtags,
    withCta,
    length,
    onPlainTextChange,
    onHtmlChange,
}: AiLabRichOutputProps) {
    const { t, i18n } = useTranslation();
    const onPlainTextChangeRef = useRef(onPlainTextChange);
    onPlainTextChangeRef.current = onPlainTextChange;
    const onHtmlChangeRef = useRef(onHtmlChange);
    onHtmlChangeRef.current = onHtmlChange;

    const extensions = useMemo(
        () => createPostEditorExtensions(t("aiCreativeLab.editor.placeholder")),
        [t, i18n.language],
    );

    const editor = useEditor(
        {
            immediatelyRender: true,
            shouldRerenderOnTransaction: false,
            extensions,
            content: "<p></p>",
            editorProps: POST_EDITOR_HTML_PROPS,
            onUpdate: ({ editor: ed }) => {
                const plain = ed.getText({ blockSeparator: "\n\n" });
                const html = ed.getHTML();
                queueMicrotask(() => {
                    onPlainTextChangeRef.current(plain);
                    onHtmlChangeRef.current?.(html);
                });
            },
        },
        [extensions],
    );

    useEffect(() => {
        if (!editor || editorResetNonce === 0) return;
        editor.commands.setContent("<p></p>", { emitUpdate: true });
        onPlainTextChangeRef.current("");
        onHtmlChangeRef.current?.("<p></p>");
    }, [editor, editorResetNonce]);

    useEffect(() => {
        if (!editor || outputRevision === 0) return;
        if (!generated) {
            editor.commands.setContent("<p></p>", { emitUpdate: true });
            onPlainTextChangeRef.current("");
            onHtmlChangeRef.current?.("<p></p>");
            return;
        }
        const html = buildGeneratedPostHtml(generated, { withHashtags, withCta, length });
        editor.commands.setContent(html, { emitUpdate: true });
        onPlainTextChangeRef.current(editor.getText({ blockSeparator: "\n\n" }));
        onHtmlChangeRef.current?.(editor.getHTML());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, outputRevision]);

    const insertImageFromUrl = useCallback(() => {
        if (!editor) return;
        const url = window.prompt(t("aiCreativeLab.editor.insertImagePrompt"));
        if (!url?.trim()) return;
        editor.chain().focus().setImage({ src: url.trim() }).run();
    }, [editor, t]);

    if (!editor) {
        return (
            <div className="min-h-[220px] animate-pulse rounded-lg bg-neutral-200/50 dark:bg-neutral-800/50" />
        );
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col font-[family-name:var(--font-display)]">
            <PostEditorToolbar editor={editor} onInsertImageUrl={insertImageFromUrl} />
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
