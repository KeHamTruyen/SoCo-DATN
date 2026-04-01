import type { FeedComment } from "../types/feed.types";
import { Link } from "react-router-dom";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { Avatar } from "../../../shared/ui";
import { formatTimeAgo } from "../../../shared/lib/formatTimeAgo";
import { useTranslation } from "react-i18next";
import { Flag, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ReportModal } from "../../report/components/ReportModal";

interface CommentListProps {
    comments: FeedComment[];
    totalCount?: number;
    onViewMore?: () => void;
    onDeleteComment?: (commentId: string) => void | Promise<void>;
    reverseOrder?: boolean;
}

export function CommentList({
    comments,
    totalCount = 0,
    onViewMore,
    onDeleteComment,
    reverseOrder = true,
}: CommentListProps) {
    const { user } = useAuthSession();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [reportCommentId, setReportCommentId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    if (comments.length === 0) {
        return null; // Do not render anything if no comments
    }

    const displayComments = reverseOrder ? [...comments].reverse() : comments;
    const hasMore = totalCount > comments.length;
    const { t } = useTranslation();

    useEffect(() => {
        if (!openMenuId) return;
        const onDoc = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenMenuId(null);
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, [openMenuId]);

    return (
        <div className="space-y-3">
            {hasMore && onViewMore && (
                <button
                    type="button"
                    onClick={onViewMore}
                    className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                    {t("feed.viewMoreComments")}
                </button>
            )}
            {displayComments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                    <Avatar
                        src={comment.user?.avatarUrl}
                        alt={comment.user?.fullName ?? comment.user?.username ?? "User"}
                        wrapperClassName="h-8 w-8 shrink-0"
                    />
                    <div className="flex min-w-0 items-start gap-2">
                        <div className="inline-block max-w-full rounded-2xl bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    <Link
                                        to={
                                            user?.id && user.id === comment.user?.id
                                                ? "/profile"
                                                : `/profile/${comment.user?.id}`
                                        }
                                        className="transition-colors hover:text-primary"
                                    >
                                        {comment.user?.fullName ?? comment.user?.username ?? "User"}
                                    </Link>
                                </p>
                                <span className="text-xs text-neutral-500 shrink-0">
                                    {formatTimeAgo(comment.createdAt)}
                                </span>
                            </div>
                            <p className="mt-0.5 text-neutral-800 dark:text-neutral-200">
                                {comment.content}
                            </p>
                        </div>
                        <div ref={openMenuId === comment.id ? menuRef : undefined} className="relative shrink-0">
                            <button
                                type="button"
                                aria-haspopup="menu"
                                aria-expanded={openMenuId === comment.id}
                                onClick={() =>
                                    setOpenMenuId((prev) => (prev === comment.id ? null : comment.id))
                                }
                                className="rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {openMenuId === comment.id ? (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-full z-50 mt-1 min-w-40 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    {user?.id === comment.user?.id ? (
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                setOpenMenuId(null);
                                                void onDeleteComment?.(comment.id);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        >
                                            <Trash2 className="h-4 w-4 shrink-0 opacity-70" />
                                            Delete comment
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                setOpenMenuId(null);
                                                setReportCommentId(comment.id);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                        >
                                            <Flag className="h-4 w-4 shrink-0 opacity-70" />
                                            Report comment
                                        </button>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ))}
            {reportCommentId ? (
                <ReportModal
                    targetType="comment"
                    targetId={reportCommentId}
                    onClose={() => setReportCommentId(null)}
                />
            ) : null}
        </div>
    );
}
