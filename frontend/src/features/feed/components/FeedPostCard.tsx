import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { Avatar, Button } from "../../../shared/ui";
import { CommentList } from "./CommentList";
import { PostActionBar } from "./PostActionBar";
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

    return (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 p-4">
                <Avatar
                    src={
                        post.author.avatarUrl ??
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
                    }
                    alt={post.author.fullName ?? post.author.email}
                />
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                        {post.author.fullName ?? post.author.username ?? "User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(post.createdAt).toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="px-4 pb-4">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {post.content}
                </p>
                {post.imageUrl ? (
                    <img
                        src={post.imageUrl}
                        alt="Post attachment"
                        className="mt-3 w-full rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                    />
                ) : null}
            </div>
            <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                <PostActionBar
                    likesCount={post.likesCount}
                    commentsCount={post.commentsCount}
                    likedByMe={post.likedByMe}
                    onLike={onLike}
                />
                <div className="mt-3 space-y-3">
                    <CommentList comments={post.comments ?? []} />
                    <div className="flex items-center gap-2">
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
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
            </div>
        </article>
    );
}

