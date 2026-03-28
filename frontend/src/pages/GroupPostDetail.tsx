import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { feedApi } from "../features/feed/api/feedApi";
import { PostDetailView } from "../features/feed/components/PostDetailView";
import type { FeedPost } from "../features/feed/types/feed.types";
import { UnifiedHeader } from "../shared/ui";

export default function GroupPostDetail() {
    const { groupId, postId } = useParams<{ groupId: string; postId: string }>();
    const [post, setPost] = useState<FeedPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!postId) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await feedApi.getPost(postId);
                if (!mounted) return;
                setPost(data);
            } catch {
                if (!mounted) return;
                setError("Post not found");
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [postId]);

    const handleLike = () => {
        if (!post) return;
        void feedApi.likePost(post.id);
        setPost((p) =>
            p ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) } : p,
        );
    };

    const handleComment = (content: string) => {
        if (!post) return;
        void feedApi.addComment(post.id, content);
        setPost((p) =>
            p ? { ...p, commentsCount: p.commentsCount + 1 } : p,
        );
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/feed"
            />

            <main className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6">
                {/* Back link */}
                <Link
                    to={`/groups/${groupId}`}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Group
                </Link>

                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="aspect-[4/5] rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                ) : error || !post ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-900/20">
                        <p className="text-red-600 dark:text-red-400">{error ?? "Post not found"}</p>
                    </div>
                ) : (
                    <PostDetailView
                        post={post}
                        onLike={handleLike}
                        onComment={handleComment}
                    />
                )}
            </main>
        </div>
    );
}
