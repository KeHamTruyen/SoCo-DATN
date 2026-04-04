import { Bookmark, Link2, Share2 } from "lucide-react";
import type { RefObject } from "react";
import type { TFunction } from "i18next";
import type { FeedPost } from "../types/feed.types";

interface FeedPostCardActionsProps {
    post: FeedPost;
    onLike: () => void;
    shareMenuRef: RefObject<HTMLDivElement | null>;
    shareMenuOpen: boolean;
    setShareMenuOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
    setLinkJustCopied: (v: boolean) => void;
    linkJustCopied: boolean;
    onCopyPostLink: () => void;
    savedId: string | null;
    saveBusy: boolean;
    onToggleSave: () => void;
    t: TFunction;
    hasProducts: boolean;
}

export function FeedPostCardActions({
    post,
    onLike,
    shareMenuRef,
    shareMenuOpen,
    setShareMenuOpen,
    setLinkJustCopied,
    linkJustCopied,
    onCopyPostLink,
    savedId,
    saveBusy,
    onToggleSave,
    t,
    hasProducts,
}: FeedPostCardActionsProps) {
    return (
        <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <div className="flex items-center gap-3">
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
                                onClick={onCopyPostLink}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            >
                                <Link2 className="h-4 w-4 shrink-0 opacity-70" />
                                {linkJustCopied ? t("feed.linkCopied") : t("feed.copyPostLink")}
                            </button>
                        </div>
                    ) : null}
                </div>
                <button
                    type="button"
                    disabled={saveBusy}
                    onClick={onToggleSave}
                    aria-label={savedId ? "Remove from saved" : "Save post"}
                    aria-pressed={!!savedId}
                    className={`flex items-center gap-1.5 text-sm transition-colors hover:text-primary disabled:opacity-60 ${
                        savedId
                            ? "font-semibold text-primary"
                            : "text-neutral-600 dark:text-neutral-400"
                    }`}
                >
                    <Bookmark className={`h-4 w-4 ${savedId ? "fill-current" : ""}`} />
                </button>
            </div>

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
    );
}
