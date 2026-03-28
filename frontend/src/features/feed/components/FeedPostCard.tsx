import { Link2, MessageSquarePlus, MoreHorizontal, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Button } from "../../../shared/ui";
import { CommentList } from "./CommentList";
import { PostDetailModal } from "./PostDetailModal";
import { formatTimeAgo } from "../../../shared/lib/formatTimeAgo";
import { useTranslation } from "react-i18next";
import type { FeedPost } from "../types/feed.types";

interface FeedPostCardProps {
    post: FeedPost;
    onLike: () => void;
    onComment: (content: string) => Promise<void> | void;
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

export function FeedPostCard({ post, onLike, onComment }: FeedPostCardProps) {
    const [newComment, setNewComment] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);
    const [shareMenuOpen, setShareMenuOpen] = useState(false);
    const [linkJustCopied, setLinkJustCopied] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const closeShareMenu = useCallback(() => {
        setShareMenuOpen(false);
    }, []);

    useEffect(() => {
        if (!shareMenuOpen) return;
        const onDoc = (e: MouseEvent) => {
            if (!shareMenuRef.current?.contains(e.target as Node)) closeShareMenu();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeShareMenu();
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, [shareMenuOpen, closeShareMenu]);

    const handleComment = () => {
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

    const postPermalink = `${window.location.origin}/posts/${post.id}`;

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

    return (
        <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {/* Author header — with optional group badge */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    {post.group ? (
                        /* ─ Group post: stacked avatar + group name above author ─ */
                        <>
                            <div className="relative h-10 w-10 shrink-0">
                                {/* Group avatar (background) */}
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                                    {post.group.avatarUrl ? (
                                        <img src={post.group.avatarUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                                    ) : (
                                        post.group.name.slice(0, 2).toUpperCase()
                                    )}
                                </div>
                                {/* User avatar (overlapping bottom-right) */}
                                <Avatar
                                    src={post.author.avatarUrl}
                                    alt={post.author.fullName ?? post.author.email}
                                    wrapperClassName="absolute -bottom-1 -right-1 h-6 w-6 border-2 border-white dark:border-neutral-900"
                                />
                            </div>
                            <div className="min-w-0">
                                <Link to={`/groups/${post.group.id}`} className="block truncate text-sm font-bold text-neutral-900 hover:text-primary dark:text-neutral-100">
                                    {post.group.name}
                                </Link>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                    {post.author.fullName ?? post.author.username ?? "User"} • {formatTimeAgo(post.createdAt)}
                                    {post.location ? ` • ${post.location}` : ""}
                                </p>
                                {post.feeling ? (
                                    <p className="text-[11px] font-medium text-primary">{post.feeling}</p>
                                ) : null}
                            </div>
                        </>
                    ) : (
                        /* ─ Normal post: regular author header ─ */
                        <>
                            <Avatar
                                src={post.author.avatarUrl}
                                alt={post.author.fullName ?? post.author.email}
                                wrapperClassName="h-10 w-10 shrink-0 border-2 border-primary"
                            />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                    {post.author.fullName ?? post.author.username ?? "User"}
                                </p>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                    {formatTimeAgo(post.createdAt)}
                                    {post.location ? ` • ${post.location}` : ""}
                                </p>
                                {post.feeling ? (
                                    <p className="text-[11px] font-medium text-primary">{post.feeling}</p>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>
                <button
                    type="button"
                    className="rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {post.content}
                </p>
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
                                        {tag.productName} • ${(tag.price ?? 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            ) : null}

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                    {/* Like */}
                    <button
                        type="button"
                        onClick={onLike}
                        className={`flex items-center gap-1.5 text-sm transition-colors hover:text-primary ${
                            post.likedByMe
                                ? "font-semibold text-primary"
                                : "text-neutral-600 dark:text-neutral-400"
                        }`}
                    >
                        <svg
                            className={`h-5 w-5 ${post.likedByMe ? "fill-current" : ""}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="text-xs font-semibold">{post.likesCount}</span>
                    </button>

                    {/* Comment */}
                    <button
                        type="button"
                        className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-primary dark:text-neutral-400"
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="text-xs font-semibold">{post.commentsCount}</span>
                    </button>

                    {/* Share */}
                    <div ref={shareMenuRef} className="relative">
                        <button
                            type="button"
                            aria-expanded={shareMenuOpen}
                            aria-haspopup="menu"
                            onClick={() => {
                                setShareMenuOpen((v) => !v);
                                setLinkJustCopied(false);
                            }}
                            className={`flex items-center gap-1.5 text-sm transition-colors hover:text-primary ${
                                shareMenuOpen
                                    ? "text-primary"
                                    : "text-neutral-600 dark:text-neutral-400"
                            }`}
                        >
                            <Share2 className="h-4 w-4" />
                            {post.sharesCount ? (
                                <span className="text-xs font-semibold">{post.sharesCount}</span>
                            ) : null}
                        </button>
                        {shareMenuOpen ? (
                            <div
                                role="menu"
                                className="absolute bottom-full left-0 z-50 mb-1 min-w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={handleCopyPostLink}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                >
                                    <Link2 className="h-4 w-4 shrink-0 opacity-70" />
                                    {linkJustCopied ? t("feed.linkCopied") : t("feed.copyPostLink")}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Conditional CTA */}
                {hasProducts ? (
                    <button
                        type="button"
                        className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700"
                    >
                        Buy Now
                    </button>
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

            {/* Comment input */}
            <div className="border-t border-neutral-100 px-4 pb-4 pt-2 dark:border-neutral-800">
                <CommentList 
                    comments={post.comments ?? []} 
                    totalCount={post.commentsCount} 
                    onViewMore={() => setShowPostModal(true)} 
                />
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

            {showPostModal && (
                <PostDetailModal
                    post={post}
                    onClose={() => setShowPostModal(false)}
                    onLike={onLike}
                    onComment={handleCommentFromModal}
                />
            )}
        </article>
    );
}
