import { useCallback, useEffect, useMemo, useState } from "react";
import { feedApi } from "../api/feedApi";
import type { FeedComment, FeedPost } from "../types/feed.types";

export function useFeed() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadInitial = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await feedApi.listPosts();
            setPosts(res.items);
            setNextCursor(res.nextCursor);
        } catch {
            setError("Unable to load feed.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadInitial();
    }, [loadInitial]);

    const loadMore = useCallback(async () => {
        if (!nextCursor || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const res = await feedApi.listPosts(nextCursor);
            setPosts((prev) => [...prev, ...res.items]);
            setNextCursor(res.nextCursor);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, nextCursor]);

    const createPost = useCallback(async (content: string) => {
        const created = await feedApi.createPost(content);
        setPosts((prev) => [created, ...prev]);
    }, []);

    const toggleLike = useCallback(async (postId: string) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                          ...post,
                          likedByMe: !post.likedByMe,
                          likesCount: post.likedByMe
                              ? Math.max(0, post.likesCount - 1)
                              : post.likesCount + 1,
                      }
                    : post,
            ),
        );
        try {
            const updated = await feedApi.likePost(postId);
            setPosts((prev) =>
                prev.map((post) => (post.id === postId ? { ...post, ...updated } : post)),
            );
        } catch {
            // Rollback on error.
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              likedByMe: !post.likedByMe,
                              likesCount: post.likedByMe
                                  ? post.likesCount + 1
                                  : Math.max(0, post.likesCount - 1),
                          }
                        : post,
                ),
            );
        }
    }, []);

    const addComment = useCallback(async (postId: string, content: string) => {
        const optimistic: FeedComment = {
            id: `temp-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            author: {
                id: "me",
                email: "me@local",
                fullName: "You",
            },
        };

        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                          ...post,
                          commentsCount: post.commentsCount + 1,
                          comments: [...(post.comments ?? []), optimistic],
                      }
                    : post,
            ),
        );

        try {
            const created = await feedApi.addComment(postId, content);
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              comments: (post.comments ?? []).map((comment) =>
                                  comment.id === optimistic.id ? created : comment,
                              ),
                          }
                        : post,
                ),
            );
        } catch {
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              commentsCount: Math.max(0, post.commentsCount - 1),
                              comments: (post.comments ?? []).filter(
                                  (comment) => comment.id !== optimistic.id,
                              ),
                          }
                        : post,
                ),
            );
        }
    }, []);

    return useMemo(
        () => ({
            posts,
            isLoading,
            isLoadingMore,
            error,
            hasMore: Boolean(nextCursor),
            loadInitial,
            loadMore,
            createPost,
            toggleLike,
            addComment,
        }),
        [
            addComment,
            createPost,
            error,
            isLoading,
            isLoadingMore,
            loadInitial,
            loadMore,
            nextCursor,
            posts,
            toggleLike,
        ],
    );
}

