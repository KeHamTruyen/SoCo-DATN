import { MessageSquarePlus, MoreHorizontal, Share2 } from "lucide-react";
import { useState } from "react";
import { Avatar, Button } from "../../../shared/ui";
import { CommentList } from "./CommentList";
import type { FeedPost } from "../types/feed.types";

interface FeedPostCardProps {
    post: FeedPost;
    onLike: () => void;
    onComment: (content: string) => Promise<void> | void;
}

export function FeedPostCard({ post, onLike, onComment }: FeedPostCardProps) {
    const [newComment, setNewComment] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);

    const handleComment = () => {
        if (!newComment.trim()) return;
        void (async () => {
            setIsCommenting(true);
            await onComment(newComment.trim());
            setNewComment("");
            setIsCommenting(false);
        })();
    };

    const hasProducts = (post.taggedProducts?.length ?? 0) > 0;

    return (
        <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {/* Author header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
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
                            {new Date(post.createdAt).toLocaleString()}
                            {post.location ? ` • ${post.location}` : ""}
                        </p>
                    </div>
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
            </div>

            {/* Image with shoppable overlays */}
            {post.imageUrl ? (
                <div className="group relative aspect-video bg-neutral-200">
                    <img
                        src={post.imageUrl}
                        alt="Post attachment"
                        className="h-full w-full object-cover"
                    />
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
                    <button
                        type="button"
                        className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-primary dark:text-neutral-400"
                    >
                        <Share2 className="h-4 w-4" />
                        {post.sharesCount ? (
                            <span className="text-xs font-semibold">{post.sharesCount}</span>
                        ) : null}
                    </button>
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
                <CommentList comments={post.comments ?? []} />
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
                        placeholder="Write a comment..."
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
        </article>
    );
}
