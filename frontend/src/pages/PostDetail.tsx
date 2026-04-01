import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { feedApi } from "../features/feed/api/feedApi";
import { FeedPostCard } from "../features/feed/components/FeedPostCard";
import type { FeedPost } from "../features/feed/types/feed.types";
import { UnifiedHeader } from "../shared/ui";

export default function PostDetail() {
    const { id, postId } = useParams<{ id?: string; postId?: string }>();
    const navigate = useNavigate();
    const resolvedPostId = postId ?? id;
    const [post, setPost] = useState<FeedPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!resolvedPostId) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await feedApi.getPost(resolvedPostId);
                if (!mounted) return;
                setPost(data);
            } catch {
                if (!mounted) return;
                setError("Unable to load post.");
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [resolvedPostId]);

    const handleLike = async () => {
        if (!post) return;
        const prev = post;
        setPost((p) => {
            if (!p) return p;
            const nextLiked = !p.likedByMe;
            return {
                ...p,
                likedByMe: nextLiked,
                likesCount: nextLiked
                    ? p.likesCount + 1
                    : Math.max(0, p.likesCount - 1),
            };
        });
        try {
            await feedApi.likePost(post.id);
        } catch {
            setPost(prev);
        }
    };

    const handleComment = async (content: string) => {
        if (!post) return;
        try {
            const comment = await feedApi.addComment(post.id, content);
            setPost((prev) =>
                prev
                    ? {
                          ...prev,
                          comments: [comment, ...(prev.comments ?? [])],
                          commentsCount: prev.commentsCount + 1,
                      }
                    : prev,
            );
        } catch {
            // silently ignore
        }
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/feed"
            />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
                {!isLoading && !error && post?.group ? (
                    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                        <Link
                            to={`/profile/${post.author.id}`}
                            className="font-medium text-neutral-700 transition-colors hover:text-primary dark:text-neutral-300"
                        >
                            {post.author.fullName ?? post.author.username ?? "User"}
                        </Link>
                        <span className="text-neutral-400">→</span>
                        <Link
                            to={`/groups/${post.group.id}`}
                            className="font-medium text-neutral-700 transition-colors hover:text-primary dark:text-neutral-300"
                        >
                            {post.group.name}
                        </Link>
                    </nav>
                ) : null}

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        <div className="aspect-4/5 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800 lg:col-span-7" />
                        <div className="space-y-4 lg:col-span-5">
                            <div className="h-48 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-64 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                    </div>
                ) : error || !post ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                        {error ?? "Post not found."}
                    </div>
                ) : (
                    <FeedPostCard
                        post={post}
                        onLike={() => void handleLike()}
                        onComment={(c) => void handleComment(c)}
                        onDeletePost={async (targetPostId) => {
                            await feedApi.deletePost(targetPostId);
                            navigate("/feed");
                        }}
                        mode="detail"
                    />
                )}
            </main>
        </div>
    );
}
