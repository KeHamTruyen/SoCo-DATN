import { CalendarClock, Edit2, Loader2, Trash2 } from "lucide-react";
import { Button } from "../../../shared/ui/atoms/button";
import type { FeedPost } from "../types/feed.types";

interface ScheduledPostsListProps {
    sectionTitle: string;
    posts: FeedPost[];
    isLoading: boolean;
    emptyTitle: string;
    emptyDescription: string;
    badgeLabel: string;
    dateLabel: string;
    onPostClick: (post: FeedPost) => void;
    onEdit: (post: FeedPost) => void;
    onDelete: (post: FeedPost) => void;
    hasMore: boolean;
    isLoadingMore?: boolean;
    onLoadMore: () => void;
}

function formatDate(date: string) {
    return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function ScheduledPostsList({
    sectionTitle,
    posts,
    isLoading,
    emptyTitle,
    emptyDescription,
    badgeLabel,
    dateLabel,
    onPostClick,
    onEdit,
    onDelete,
    hasMore,
    isLoadingMore = false,
    onLoadMore,
}: ScheduledPostsListProps) {
    const header = (
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
                {sectionTitle}{" "}
                <span className="ml-2 text-sm font-normal text-neutral-400">({posts.length})</span>
            </h2>
        </div>
    );

    if (isLoading) {
        return (
            <div className="space-y-4">
                {header}
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
                    />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="space-y-4">
                {header}
                <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
                    <CalendarClock className="mx-auto mb-3 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                    <p className="font-medium text-neutral-500">{emptyTitle}</p>
                    <p className="mt-1 text-sm text-neutral-400">{emptyDescription}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {header}
            {posts.map((post) => (
                <div
                    key={post.id}
                    className="cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-colors hover:border-primary/40 dark:border-neutral-800 dark:bg-neutral-900"
                    onClick={() => onPostClick(post)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onPostClick(post);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex items-start justify-between gap-4 p-4">
                        <div className="flex items-start gap-4">
                            {post.imageUrl && (
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                    <img
                                        src={post.imageUrl}
                                        alt="Post thumbnail"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <p className="line-clamp-2 text-sm text-neutral-700 dark:text-neutral-300">
                                    {post.content}
                                </p>
                                {(post.publishedAt ?? post.scheduledAt) && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                                        <CalendarClock className="h-3.5 w-3.5" />
                                        <span>{dateLabel}:</span>
                                        {formatDate(post.publishedAt ?? post.scheduledAt ?? "")}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onEdit(post);
                                }}
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-red-700"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDelete(post);
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 border-t border-neutral-100 bg-neutral-50/50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-800/50">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                            {badgeLabel}
                        </span>
                        {post.taggedProducts && post.taggedProducts.length > 0 && (
                            <span className="text-xs text-neutral-500">
                                {post.taggedProducts.length} product(s) tagged
                            </span>
                        )}
                    </div>
                </div>
            ))}

            {hasMore ? (
                <div className="flex justify-center">
                    <Button variant="outline" onClick={onLoadMore} disabled={isLoadingMore}>
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load more"
                        )}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
