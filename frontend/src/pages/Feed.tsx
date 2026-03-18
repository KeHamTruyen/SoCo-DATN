import { useFeed } from "../features/feed/hooks/useFeed";
import { FeedPostCard } from "../features/feed/components/FeedPostCard";
import { PostComposer } from "../features/feed/components/PostComposer";
import { Button, UnifiedHeader } from "../shared/ui";

export default function Feed() {
    const {
        posts,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        loadMore,
        createPost,
        toggleLike,
        addComment,
    } = useFeed();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/feed"
            />
            <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_300px]">
                <section className="space-y-4">
                    <PostComposer onCreate={createPost} />
                    {isLoading ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                            Loading feed...
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                            No posts yet. Be the first one to share.
                        </div>
                    ) : (
                        posts.map((post) => (
                            <FeedPostCard
                                key={post.id}
                                post={post}
                                onLike={() => toggleLike(post.id)}
                                onComment={(content) => addComment(post.id, content)}
                            />
                        ))
                    )}
                    {hasMore ? (
                        <div className="flex justify-center py-2">
                            <Button
                                variant="outline"
                                onClick={loadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? "Loading..." : "Load more"}
                            </Button>
                        </div>
                    ) : null}
                </section>
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-sm font-bold">Feed Tips</h3>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                Keep posts short and product-focused to improve
                                engagement.
                            </p>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

