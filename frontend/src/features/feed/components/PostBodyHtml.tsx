import { memo } from "react";
import { cn } from "../../../shared/lib/cn";
import { looksLikeRichPostContent, sanitizePostHtml } from "../../../shared/tiptap/postHtmlUtils";

function escapePlainText(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

interface PostBodyHtmlProps {
    content: string;
    className?: string;
    /** Văn bản thuần (bài cũ): giữ xuống dòng. */
    plainClassName?: string;
}

/**
 * Hiển thị nội dung bài viết: HTML (TipTap) đã khử trùng, hoặc plain text (legacy).
 */
export const PostBodyHtml = memo(function PostBodyHtml({
    content,
    className,
    plainClassName,
}: PostBodyHtmlProps) {
    const raw = content ?? "";
    if (!raw.trim()) return null;

    if (looksLikeRichPostContent(raw)) {
        return (
            <div
                className={cn(
                    "post-body-html text-sm leading-relaxed text-neutral-800 dark:text-neutral-200",
                    "[&_a]:text-primary [&_a]:underline [&_img]:my-2 [&_img]:max-h-96 [&_img]:rounded-lg",
                    "[&_p]:my-1.5 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5",
                    "[&_strong]:font-semibold [&_em]:italic [&_u]:underline",
                    className,
                )}
                dangerouslySetInnerHTML={{ __html: sanitizePostHtml(raw) }}
            />
        );
    }

    return (
        <p
            className={cn(
                "whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300",
                plainClassName,
                className,
            )}
            dangerouslySetInnerHTML={{ __html: escapePlainText(raw).replace(/\n/g, "<br/>") }}
        />
    );
});
