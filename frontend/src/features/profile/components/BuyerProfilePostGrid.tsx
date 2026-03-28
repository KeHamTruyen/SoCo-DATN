import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { FeedPost } from "../../feed/types/feed.types";
import { useTranslation } from "react-i18next";

function formatPostAge(iso: string, t: (k: string, o?: Record<string, unknown>) => string): string {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return t("profile.postAgeJustNow");
    if (hours < 24) return t("profile.postAgeHours", { count: hours });
    const days = Math.floor(hours / 24);
    if (days === 1) return t("profile.postAgeYesterday");
    if (days < 7) return t("profile.postAgeDays", { count: days });
    return t("profile.postAgeWeekPlus");
}

interface BuyerProfilePostGridProps {
    posts: FeedPost[];
    isLoading: boolean;
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
}

export function BuyerProfilePostGrid({
    posts,
    isLoading,
    hasMore = false,
    loadingMore = false,
    onLoadMore,
}: BuyerProfilePostGridProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse overflow-hidden rounded-xl border border-border bg-card"
                    >
                        <div className="aspect-video bg-muted" />
                        <div className="space-y-2 p-4">
                            <div className="h-4 rounded bg-muted" />
                            <div className="h-3 w-1/2 rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">{t("profile.noPosts")}</div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        to={`/posts/${post.id}`}
                        className="group overflow-hidden rounded-xl border border-border bg-muted/40 transition-shadow hover:shadow-md dark:bg-muted/20"
                    >
                        <div className="aspect-video overflow-hidden bg-muted">
                            {post.imageUrl ? (
                                <img
                                    src={post.imageUrl}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                                    {post.content}
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <p className="mb-3 line-clamp-2 text-sm text-foreground/90">
                                {post.content}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-1">
                                        <Heart className="h-3.5 w-3.5" />
                                        {post.likesCount}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        {post.commentsCount}
                                    </span>
                                </div>
                                <span>{formatPostAge(post.createdAt, t)}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {hasMore && onLoadMore ? (
                <div className="mt-8 flex justify-center">
                    <button
                        type="button"
                        disabled={loadingMore}
                        onClick={() => onLoadMore()}
                        className="rounded-xl border border-border bg-background px-6 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                        {loadingMore ? t("profile.loadingMore") : t("profile.loadMorePosts")}
                    </button>
                </div>
            ) : null}
        </>
    );
}
