import { useState } from "react";
import { feedApi } from "../features/feed/api/feedApi";
import type { CreatePostPayload } from "../features/feed/types/feed.types";
import { CreatePostModal } from "../features/feed/components/CreatePostModal";
import { FeedPostCard } from "../features/feed/components/FeedPostCard";
import {
    LeftSidebar,
    RightSidebar,
} from "../features/feed/components/FeedSidebars";
import { PostComposer } from "../features/feed/components/PostComposer";
import { SavedPostsStatusProvider } from "../features/feed/context/SavedPostsStatusContext";
import { useFeed } from "../features/feed/hooks/useFeed";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { isSellerRole } from "../shared/auth/roleGuards";
import { Button, GuestAuthModal } from "../shared/ui";

export default function Feed() {
    const { user, isAuthenticated } = useAuthSession();
    const [showGuestAuthModal, setShowGuestAuthModal] = useState(false);
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
        loadInitial,
    } = useFeed({
        isAuthenticated,
        onAuthRequired: () => setShowGuestAuthModal(true),
    });
    const isSeller = isSellerRole(user?.role);
    const [showModal, setShowModal] = useState(false);

    const handleCreate = async (payload: CreatePostPayload) => {
        if (!isAuthenticated) {
            setShowGuestAuthModal(true);
            return;
        }
        if (payload.scheduledAt) {
            await feedApi.createScheduledPost(payload);
        } else {
            await createPost(payload);
        }
    };

    return (
        <>
            <main className="mx-auto flex w-full max-w-[1440px] flex-1 gap-6 px-6 py-6">
                <LeftSidebar isSeller={isSeller} />

                <section
                    className="min-w-0 flex-1 space-y-4"
                    style={{ maxWidth: "680px" }}
                >
                    <PostComposer
                        onOpen={() => {
                            if (!isAuthenticated) {
                                setShowGuestAuthModal(true);
                                return;
                            }
                            setShowModal(true);
                        }}
                    />

                    {isLoading ? (
                        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                            Loading feed...
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                            No posts yet. Be the first one to share!
                        </div>
                    ) : (
                        <SavedPostsStatusProvider postIds={posts.map((p) => p.id)}>
                            {posts.map((post) => (
                                <FeedPostCard
                                    key={post.id}
                                    post={post}
                                    onLike={() => toggleLike(post.id)}
                                    onComment={(content) =>
                                        addComment(post.id, content)
                                    }
                                    onDeletePost={async (postId) => {
                                        await feedApi.deletePost(postId);
                                        await loadInitial();
                                    }}
                                />
                            ))}
                        </SavedPostsStatusProvider>
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

                <RightSidebar />
            </main>

            {showModal && (
                <CreatePostModal
                    onClose={() => setShowModal(false)}
                    onCreate={(payload) => handleCreate(payload)}
                />
            )}
            <GuestAuthModal
                open={showGuestAuthModal}
                onClose={() => setShowGuestAuthModal(false)}
            />
        </>
    );
}
