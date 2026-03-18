import { CalendarClock, Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "../../../shared/ui/atoms/button";
import type { FeedPost } from "../types/feed.types";

interface ScheduledPostsListProps {
    posts: FeedPost[];
    isLoading: boolean;
    onDelete: (postId: string) => void;
}

export function ScheduledPostsList({ posts, isLoading, onDelete }: ScheduledPostsListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                    />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <CalendarClock className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="font-medium text-slate-500">No scheduled posts yet.</p>
                <p className="mt-1 text-sm text-slate-400">
                    Create a post and schedule it for a future date.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <div
                    key={post.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <div className="flex items-start justify-between gap-4 p-4">
                        <div className="flex items-start gap-4">
                            {post.imageUrl && (
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <img
                                        src={post.imageUrl}
                                        alt="Post thumbnail"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <p className="line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
                                    {post.content}
                                </p>
                                {post.scheduledAt && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                                        <CalendarClock className="h-3.5 w-3.5" />
                                        {new Date(post.scheduledAt).toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => onDelete(post.id)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-2 dark:border-slate-800 dark:bg-slate-800/50">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                            Scheduled
                        </span>
                        {post.taggedProducts && post.taggedProducts.length > 0 && (
                            <span className="text-xs text-slate-500">
                                {post.taggedProducts.length} product(s) tagged
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
