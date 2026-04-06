import { Heart, MessageCircle, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import type { FeedPost } from "../../feed/types/feed.types";
import { stripHtmlToPlain } from "../../../shared/tiptap/postHtmlUtils";

interface ProfilePostsGridProps {
    columns?: 2 | 3;
}

import { useProfileContext } from "../context/ProfileContext";

export function ProfilePostsGrid({
    columns = 3,
}: ProfilePostsGridProps) {
    const { posts, isLoading, openProfilePostModal: onPostClick } = useProfileContext();

    if (isLoading) {
        return (
            <div
                className={`grid gap-4 ${columns === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}
            >
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
                    />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="py-12 text-center text-neutral-400">No posts yet.</div>
        );
    }

    return (
        <div
            className={`grid gap-4 ${columns === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}
        >
            {posts.map((post) => {
                const tileClass =
                    "group relative block w-full overflow-hidden rounded-xl bg-neutral-100 text-left dark:bg-neutral-800";
                const inner = (
                    <>
                        {post.imageUrl ? (
                            <img
                                src={post.imageUrl}
                                alt="Post"
                                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex aspect-square items-center justify-center p-4 text-sm text-neutral-400">
                                <p className="line-clamp-4 text-center">{stripHtmlToPlain(post.content)}</p>
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="flex items-center gap-1 text-sm font-bold text-white">
                                <Heart className="h-4 w-4 fill-white" />
                                {post.likesCount}
                            </span>
                            <span className="flex items-center gap-1 text-sm font-bold text-white">
                                <MessageCircle className="h-4 w-4 fill-white" />
                                {post.commentsCount}
                            </span>
                        </div>
                        {post.taggedProducts && post.taggedProducts.length > 0 && (
                            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow">
                                <Tag className="h-3 w-3 text-primary" />
                            </div>
                        )}
                    </>
                );
                return onPostClick ? (
                    <button
                        key={post.id}
                        type="button"
                        className={tileClass}
                        onClick={() => onPostClick(post)}
                    >
                        {inner}
                    </button>
                ) : (
                    <Link key={post.id} to={`/post/${post.id}`} className={tileClass}>
                        {inner}
                    </Link>
                );
            })}
        </div>
    );
}
