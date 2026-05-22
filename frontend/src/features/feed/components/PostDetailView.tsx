import {
    Bookmark,
    Flag,
    Heart,
    MessageCircle,
    MessageSquarePlus,
    MoreHorizontal,
    Send,
    Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { Button } from "../../../shared/ui/atoms/button";
import { cn } from "../../../shared/lib/cn";
import { feedApi } from "../api/feedApi";
import type { FeedPost } from "../types/feed.types";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { CommentList } from "./CommentList";
import { PostBodyHtml } from "./PostBodyHtml";
import { PostAuthorMetaHeader } from "./PostAuthorMetaHeader";
import { PostDetailMediaColumn } from "./PostDetailMediaColumn";
import { getUniqueTaggedProducts } from "../utils/postProductActions";
import { PostBuyNowDropdown } from "./PostBuyNowDropdown";
import { resolvePostMediaUrls } from "../utils/postMediaUtils";
import { ReportModal } from "../../report/components/ReportModal";
import { useSavedPostItem } from "../hooks/useSavedPostItem";
import { usePostCommentsPagination } from "../hooks/usePostCommentsPagination";

interface PostDetailViewProps {
    post: FeedPost;
    onLike: () => void;
    onComment: (content: string) => void;
    onDeletePost?: (postId: string) => Promise<void> | void;
}

export function PostDetailView({ post, onLike, onComment, onDeletePost }: PostDetailViewProps) {
    const { t } = useTranslation();
    const { user } = useAuthSession();
    const [commentInput, setCommentInput] = useState("");
    const { savedId, saveBusy, toggleSave } = useSavedPostItem(post.id);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [deletedCommentIds, setDeletedCommentIds] = useState<string[]>([]);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const commentInputRef = useRef<HTMLInputElement>(null);

    const embeddedCount = post.comments?.length ?? 0;
    const { olderComments, loadingMore, hasMore, loadMoreComments } = usePostCommentsPagination({
        postId: post.id,
        embeddedCommentCount: embeddedCount,
        commentsCount: post.commentsCount,
        pageSize: 5,
        enabled: true,
    });

    const displayComments = [...olderComments, ...[...(post.comments || [])].reverse()].filter(
        (comment) => !deletedCommentIds.includes(comment.id),
    );

    const handleSendComment = () => {
        const trimmed = commentInput.trim();
        if (!trimmed) return;
        onComment(trimmed);
        setCommentInput("");
    };

    const isOwnPost = user?.id === post.author.id;

    const handleCommentIconClick = () => {
        commentInputRef.current?.focus();
    };

    useEffect(() => {
        if (!moreMenuOpen) return;
        const onDoc = (e: MouseEvent) => {
            if (!moreMenuRef.current?.contains(e.target as Node)) setMoreMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMoreMenuOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, [moreMenuOpen]);

    const handleDeleteComment = async (commentId: string) => {
        try {
            await feedApi.deleteComment(commentId);
            setDeletedCommentIds((prev) => [...prev, commentId]);
        } catch {
            // Ignore deletion errors for now.
        }
    };

    const mediaUrls = resolvePostMediaUrls(post);
    const primaryMedia = mediaUrls[0];
    const isVideo = post.mediaType === "VIDEO";
    const hasPrimaryMedia = mediaUrls.length > 0;
    const hasProducts = (post.taggedProducts?.length ?? 0) > 0;
    const taggedProductsForBuy = hasProducts ? getUniqueTaggedProducts(post) : [];

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {hasPrimaryMedia && primaryMedia ? (
                <PostDetailMediaColumn post={post} primaryMedia={primaryMedia} isVideo={isVideo} />
            ) : null}

            <div className={cn(hasPrimaryMedia ? "lg:col-span-5" : "lg:col-span-12")}>
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between p-4">
                        <PostAuthorMetaHeader post={post} variant="detail" />
                        <div ref={moreMenuRef} className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMoreMenuOpen((v) => !v)}
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                            {moreMenuOpen ? (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-full z-50 mt-1 min-w-40 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    {isOwnPost ? (
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                setMoreMenuOpen(false);
                                                void onDeletePost?.(post.id);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        >
                                            <Trash2 className="h-4 w-4 shrink-0 opacity-70" />
                                            Delete post
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                setMoreMenuOpen(false);
                                                setReportModalOpen(true);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                        >
                                            <Flag className="h-4 w-4 shrink-0 opacity-70" />
                                            Report post
                                        </button>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="px-4 pb-3">
                        <PostBodyHtml
                            content={post.content}
                            className="text-neutral-700 dark:text-neutral-300"
                            plainClassName="text-neutral-700 dark:text-neutral-300"
                        />
                        {post.taggedUsers && post.taggedUsers.length > 0 ? (
                            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                                <span className="font-semibold text-neutral-500">{t("feed.with")}</span>
                                {post.taggedUsers.map((u, i) => (
                                    <span key={u.id}>
                                        {i > 0 ? ", " : ""}
                                        <Link
                                            to={`/profile/${u.id}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {u.fullName ?? u.username ?? "User"}
                                        </Link>
                                    </span>
                                ))}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onLike}
                                className={cn(
                                    "flex items-center gap-1.5 text-sm transition-colors hover:text-primary",
                                    post.likedByMe
                                        ? "font-semibold text-primary"
                                        : "text-neutral-600 dark:text-neutral-400",
                                )}
                            >
                                <Heart className={cn("h-5 w-5", post.likedByMe && "fill-current")} />
                                <span className="text-xs font-semibold">{post.likesCount}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCommentIconClick}
                                className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-primary dark:text-neutral-400"
                            >
                                <MessageCircle className="h-5 w-5" />
                                <span className="text-xs font-semibold">{post.commentsCount}</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-primary dark:text-neutral-400"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                disabled={saveBusy}
                                onClick={toggleSave}
                                aria-label={savedId ? "Remove from saved" : "Save post"}
                                aria-pressed={!!savedId}
                                className={cn(
                                    "flex items-center gap-1.5 text-sm transition-colors hover:text-primary disabled:opacity-60",
                                    savedId
                                        ? "font-semibold text-primary"
                                        : "text-neutral-600 dark:text-neutral-400",
                                )}
                            >
                                <Bookmark className={cn("h-4 w-4", savedId && "fill-current")} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            {taggedProductsForBuy.length > 0 ? (
                                <PostBuyNowDropdown products={taggedProductsForBuy} menuAlign="right" />
                            ) : post.linkUrl ? (
                                <a
                                    href={post.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg border border-primary px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/5"
                                >
                                    Learn More
                                </a>
                            ) : null}
                        </div>
                    </div>

                    <div className="border-t border-neutral-100 px-4 pb-4 pt-2 dark:border-neutral-800">
                        <div className="space-y-3">
                            {hasMore ? (
                                <div className="flex justify-center pb-2">
                                    <button
                                        type="button"
                                        onClick={() => void loadMoreComments()}
                                        disabled={loadingMore}
                                        className="text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-700 disabled:opacity-60 dark:hover:text-neutral-300"
                                    >
                                        {loadingMore ? "Loading..." : t("feed.viewMoreComments")}
                                    </button>
                                </div>
                            ) : null}
                            {displayComments.length > 0 ? (
                                <CommentList
                                    comments={displayComments}
                                    totalCount={Math.max(0, post.commentsCount - deletedCommentIds.length)}
                                    reverseOrder={false}
                                    onDeleteComment={handleDeleteComment}
                                />
                            ) : null}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <input
                                ref={commentInputRef}
                                type="text"
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendComment();
                                    }
                                }}
                                placeholder={t("feed.writeComment")}
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800"
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={!commentInput.trim()}
                                onClick={handleSendComment}
                            >
                                <MessageSquarePlus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {reportModalOpen ? (
                <ReportModal
                    targetType="post"
                    targetId={post.id}
                    onClose={() => setReportModalOpen(false)}
                />
            ) : null}
        </div>
    );
}
