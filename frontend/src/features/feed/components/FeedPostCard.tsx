import { Flag, MessageSquarePlus, MoreHorizontal, Trash2 } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { Button, GuestAuthModal } from "../../../shared/ui";
import { ReportModal } from "../../report/components/ReportModal";
import { CommentList } from "./CommentList";
import { PostDetailModal } from "./PostDetailModal";
import { useTranslation } from "react-i18next";
import { feedApi } from "../api/feedApi";
import type { FeedPost } from "../types/feed.types";
import { PostBodyHtml } from "./PostBodyHtml";
import { FeedPostCardActions } from "./FeedPostCardActions";
import { PostAuthorMetaHeader } from "./PostAuthorMetaHeader";
import { useSavedPostItem } from "../hooks/useSavedPostItem";
import { usePostCommentsPagination } from "../hooks/usePostCommentsPagination";
import { formatCurrencyVnd } from "../../../shared/lib/formatCurrencyVnd";

interface FeedPostCardProps {
    post: FeedPost;
    onLike: () => void;
    onComment: (content: string) => Promise<void> | void;
    onDeletePost?: (postId: string) => Promise<void> | void;
    mode?: "feed" | "detail";
}

async function copyTextToClipboard(text: string) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
}

function FeedPostCardComponent({
    post,
    onLike,
    onComment,
    onDeletePost,
    mode = "feed",
}: FeedPostCardProps) {
    const { user } = useAuthSession();
    const [newComment, setNewComment] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);
    const [shareMenuOpen, setShareMenuOpen] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [linkJustCopied, setLinkJustCopied] = useState(false);
    const [deletedCommentIds, setDeletedCommentIds] = useState<string[]>([]);
    const [showGuestAuthModal, setShowGuestAuthModal] = useState(false);
    const { savedId, saveBusy, toggleSave } = useSavedPostItem(post.id);
    const { olderComments, loadingMore, hasMore, loadMoreComments } = usePostCommentsPagination({
        postId: post.id,
        embeddedCommentCount: post.comments?.length ?? 0,
        commentsCount: post.commentsCount,
        enabled: mode === "detail",
    });
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const closeShareMenu = useCallback(() => {
        setShareMenuOpen(false);
    }, []);

    const closeMoreMenu = useCallback(() => {
        setMoreMenuOpen(false);
    }, []);

    useEffect(() => {
        if (!shareMenuOpen && !moreMenuOpen) return;
        const onDoc = (e: MouseEvent) => {
            if (!shareMenuRef.current?.contains(e.target as Node)) closeShareMenu();
            if (!moreMenuRef.current?.contains(e.target as Node)) closeMoreMenu();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeShareMenu();
                closeMoreMenu();
            }
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, [shareMenuOpen, moreMenuOpen, closeShareMenu, closeMoreMenu]);

    const handleComment = () => {
        if (!user) {
            setShowGuestAuthModal(true);
            return;
        }
        if (!newComment.trim()) return;
        void (async () => {
            setIsCommenting(true);
            await onComment(newComment.trim());
            setNewComment("");
            setIsCommenting(false);
        })();
    };

    const handleCommentFromModal = (content: string) => {
        void onComment(content);
    };

    const handleDeletePost = () => {
        closeMoreMenu();
        void onDeletePost?.(post.id);
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await feedApi.deleteComment(commentId);
            setDeletedCommentIds((prev) => [...prev, commentId]);
        } catch {
            // Ignore deletion errors for now.
        }
    };

    const displayComments =
        mode === "detail"
            ? [...olderComments, ...[...(post.comments ?? [])].reverse()].filter(
                  (comment) => !deletedCommentIds.includes(comment.id),
              )
            : (post.comments ?? []).filter(
                  (comment) => !deletedCommentIds.includes(comment.id),
              );

    const postPermalink = `${window.location.origin}/post/${post.id}`;

    const handleCopyPostLink = () => {
        void (async () => {
            try {
                await copyTextToClipboard(postPermalink);
                setLinkJustCopied(true);
                window.setTimeout(() => {
                    setLinkJustCopied(false);
                    closeShareMenu();
                }, 1200);
            } catch {
                setLinkJustCopied(false);
            }
        })();
    };

    const hasProducts = (post.taggedProducts?.length ?? 0) > 0;
    const primaryMedia = post.imageUrl;
    const extraMedia =
        (post.mediaUrls?.length ?? 0) > 1 ? (post.mediaUrls!.length - 1) : 0;
    const isVideo = post.mediaType === "VIDEO";
    const authorProfileLink =
        user?.id && user.id === post.author.id ? "/profile" : `/profile/${post.author.id}`;
    const isOwnPost = user?.id === post.author.id;

    return (
        <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {/* Author header — with optional group badge */}
            <div className="flex items-center justify-between p-4">
                <PostAuthorMetaHeader
                    post={post}
                    variant="compact"
                    authorProfilePath={authorProfileLink}
                />
                <div ref={moreMenuRef} className="relative">
                    <button
                        type="button"
                        aria-expanded={moreMenuOpen}
                        aria-haspopup="menu"
                        onClick={() => setMoreMenuOpen((v) => !v)}
                        className="rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                    {moreMenuOpen ? (
                        <div
                            role="menu"
                            className="absolute right-0 top-full z-50 mt-1 min-w-40 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                        >
                            {isOwnPost ? (
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={handleDeletePost}
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
                                        closeMoreMenu();
                                        if (!user) {
                                            setShowGuestAuthModal(true);
                                            return;
                                        }
                                        setReportModalOpen(true);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                >
                                    <Flag className="h-4 w-4 shrink-0 opacity-70" />
                                    {t("feed.reportPost", "Report post")}
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Content */}
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

            {/* Image with shoppable overlays */}
            {primaryMedia ? (
                <div className="group relative aspect-video bg-neutral-200">
                    {isVideo ? (
                        <video
                            src={primaryMedia}
                            controls
                            className="h-full w-full object-cover"
                            playsInline
                        />
                    ) : (
                        <img
                            src={primaryMedia}
                            alt="Post attachment"
                            className="h-full w-full object-cover"
                        />
                    )}
                    {extraMedia > 0 ? (
                        <div className="absolute bottom-2 right-2 rounded-full bg-neutral-900/80 px-2 py-0.5 text-xs font-semibold text-white">
                            +{extraMedia}
                        </div>
                    ) : null}
                    {hasProducts &&
                        post.taggedProducts!.map((tag) => (
                            <div
                                key={tag.id}
                                className="absolute transition-transform group-hover:scale-110"
                                style={{
                                    top: `${tag.positionY}%`,
                                    left: `${tag.positionX}%`,
                                }}
                            >
                                <div className="relative">
                                    <div className="h-4 w-4 animate-pulse rounded-full border-2 border-white bg-primary" />
                                    <div className="absolute top-6 left-0 whitespace-nowrap rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold shadow-lg backdrop-blur dark:bg-neutral-900/90">
                                        {tag.productName} • {formatCurrencyVnd(tag.price ?? 0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            ) : null}

            <FeedPostCardActions
                post={post}
                onLike={onLike}
                shareMenuRef={shareMenuRef}
                shareMenuOpen={shareMenuOpen}
                setShareMenuOpen={setShareMenuOpen}
                setLinkJustCopied={setLinkJustCopied}
                linkJustCopied={linkJustCopied}
                onCopyPostLink={handleCopyPostLink}
                savedId={savedId}
                saveBusy={saveBusy}
                onToggleSave={() => {
                    if (!user) {
                        setShowGuestAuthModal(true);
                        return;
                    }
                    toggleSave();
                }}
                t={t}
                hasProducts={hasProducts}
            />

            {/* Comment input */}
            <div className="border-t border-neutral-100 px-4 pb-4 pt-2 dark:border-neutral-800">
                {mode === "detail" ? (
                    <div className="space-y-3">
                        {hasMore ? (
                            <button
                                type="button"
                                onClick={() => void loadMoreComments()}
                                disabled={loadingMore}
                                className="text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-700 disabled:opacity-60 dark:hover:text-neutral-300"
                            >
                                {loadingMore
                                    ? "Loading..."
                                    : t("feed.viewMoreComments")}
                            </button>
                        ) : null}
                        {displayComments.length > 0 ? (
                            <CommentList
                                comments={displayComments}
                                totalCount={displayComments.length}
                                reverseOrder={false}
                                onDeleteComment={handleDeleteComment}
                            />
                        ) : null}
                    </div>
                ) : (
                    <CommentList
                        comments={displayComments}
                        totalCount={Math.max(0, post.commentsCount - deletedCommentIds.length)}
                        onViewMore={() => setShowPostModal(true)}
                        onDeleteComment={handleDeleteComment}
                    />
                )}
                <div className="mt-3 flex items-center gap-2">
                    <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleComment();
                            }
                        }}
                        placeholder={t("feed.writeComment")}
                        className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isCommenting || !newComment.trim()}
                        onClick={handleComment}
                    >
                        <MessageSquarePlus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {mode === "feed" && showPostModal && (
                <PostDetailModal
                    post={post}
                    onClose={() => setShowPostModal(false)}
                    onLike={onLike}
                    onComment={handleCommentFromModal}
                    onDeletePost={onDeletePost}
                />
            )}
            {reportModalOpen ? (
                <ReportModal
                    targetType="post"
                    targetId={post.id}
                    onClose={() => setReportModalOpen(false)}
                    onSuccess={() => setReportModalOpen(false)}
                />
            ) : null}
            <GuestAuthModal
                open={showGuestAuthModal}
                onClose={() => setShowGuestAuthModal(false)}
            />
        </article>
    );
}

export const FeedPostCard = memo(FeedPostCardComponent);
