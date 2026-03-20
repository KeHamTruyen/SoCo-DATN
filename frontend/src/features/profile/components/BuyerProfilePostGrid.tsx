import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { FeedPost } from "../../feed/types/feed.types";

function formatPostAge(iso: string): string {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;
    return "Tuần trước";
}

interface BuyerProfilePostGridProps {
    posts: FeedPost[];
    isLoading: boolean;
}

export function BuyerProfilePostGrid({ posts, isLoading }: BuyerProfilePostGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                    >
                        <div className="aspect-video bg-neutral-200 dark:bg-neutral-700" />
                        <div className="space-y-2 p-4">
                            <div className="h-4 rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return <div className="py-12 text-center text-neutral-400">Chưa có bài viết.</div>;
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        to={`/posts/${post.id}`}
                        className="group overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/50"
                    >
                        <div className="aspect-video overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                            {post.imageUrl ? (
                                <img
                                    src={post.imageUrl}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center p-4 text-center text-sm text-neutral-500">
                                    {post.content}
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <p className="mb-3 line-clamp-2 text-sm text-neutral-700 dark:text-neutral-300">
                                {post.content}
                            </p>
                            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
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
                                <span>{formatPostAge(post.createdAt)}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-8 flex justify-center">
                <button
                    type="button"
                    className="rounded-xl border border-neutral-200 px-6 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                    Tải thêm bài viết
                </button>
            </div>
        </>
    );
}
