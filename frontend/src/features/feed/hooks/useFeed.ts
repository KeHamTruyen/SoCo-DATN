import { useCallback, useMemo } from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { feedApi } from "../api/feedApi";
import type { CreatePostPayload, FeedComment, FeedPost } from "../types/feed.types";
import { queryKeys } from "../../../shared/query/queryKeys";

interface UseFeedOptions {
    isAuthenticated: boolean;
    onAuthRequired: () => void;
}

export function useFeed({ isAuthenticated, onAuthRequired }: UseFeedOptions) {
    const queryClient = useQueryClient();
    const feedKey = queryKeys.feed.list("home");

    const feedQuery = useInfiniteQuery({
        queryKey: feedKey,
        queryFn: ({ pageParam }: { pageParam: string | null }) =>
            feedApi.listPosts(pageParam ?? undefined),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: null as string | null,
    });

    const createPostMutation = useMutation({
        mutationFn: (payload: CreatePostPayload) => feedApi.createPost(payload),
        onSuccess(createdPost) {
            queryClient.setQueryData(
                feedKey,
                (old:
                    | {
                          pages: Array<{ items: FeedPost[]; nextCursor: string | null }>;
                          pageParams: Array<string | null>;
                      }
                    | undefined) => {
                    if (!old || old.pages.length === 0) {
                        return {
                            pages: [{ items: [createdPost], nextCursor: null }],
                            pageParams: [null],
                        };
                    }
                    const [firstPage, ...restPages] = old.pages;
                    return {
                        ...old,
                        pages: [
                            { ...firstPage, items: [createdPost, ...firstPage.items] },
                            ...restPages,
                        ],
                    };
                },
            );
        },
    });

    const likeMutation = useMutation({
        mutationFn: (postId: string) => feedApi.likePost(postId),
    });

    const addCommentMutation = useMutation({
        mutationFn: ({ postId, content }: { postId: string; content: string }) =>
            feedApi.addComment(postId, content),
    });

    const posts = useMemo(
        () => feedQuery.data?.pages.flatMap((page) => page.items) ?? [],
        [feedQuery.data],
    );

    const createPost = useCallback(async (payload: CreatePostPayload) => {
        if (!isAuthenticated) {
            onAuthRequired();
            return;
        }
        await createPostMutation.mutateAsync(payload);
    }, [createPostMutation, isAuthenticated, onAuthRequired]);

    const toggleLike = useCallback(async (postId: string) => {
        if (!isAuthenticated) {
            onAuthRequired();
            return;
        }
        const previousData = queryClient.getQueryData(feedKey);
        queryClient.setQueryData(
            feedKey,
            (old:
                | {
                      pages: Array<{ items: FeedPost[]; nextCursor: string | null }>;
                      pageParams: Array<string | null>;
                  }
                | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        items: page.items.map((post) =>
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
                    })),
                };
            },
        );
        try {
            await likeMutation.mutateAsync(postId);
        } catch {
            queryClient.setQueryData(feedKey, previousData);
        }
    }, [feedKey, isAuthenticated, likeMutation, onAuthRequired, queryClient]);

    const addComment = useCallback(async (postId: string, content: string) => {
        if (!isAuthenticated) {
            onAuthRequired();
            return;
        }
        const optimistic: FeedComment = {
            id: `temp-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            user: {
                id: "me",
                email: "me@local",
                fullName: "You",
            },
        };

        const previousData = queryClient.getQueryData(feedKey);
        queryClient.setQueryData(
            feedKey,
            (old:
                | {
                      pages: Array<{ items: FeedPost[]; nextCursor: string | null }>;
                      pageParams: Array<string | null>;
                  }
                | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        items: page.items.map((post) =>
                            post.id === postId
                                ? {
                                      ...post,
                                      commentsCount: post.commentsCount + 1,
                                      comments: [optimistic, ...(post.comments ?? [])],
                                  }
                                : post,
                        ),
                    })),
                };
            },
        );

        try {
            const created = await addCommentMutation.mutateAsync({ postId, content });
            queryClient.setQueryData(
                feedKey,
                (old:
                    | {
                          pages: Array<{ items: FeedPost[]; nextCursor: string | null }>;
                          pageParams: Array<string | null>;
                      }
                    | undefined) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            items: page.items.map((post) =>
                                post.id === postId
                                    ? {
                                          ...post,
                                          comments: (post.comments ?? []).map((comment) =>
                                              comment.id === optimistic.id ? created : comment,
                                          ),
                                      }
                                    : post,
                            ),
                        })),
                    };
                },
            );
        } catch {
            queryClient.setQueryData(feedKey, previousData);
        }
    }, [addCommentMutation, feedKey, isAuthenticated, onAuthRequired, queryClient]);

    const loadInitial = useCallback(async () => {
        await feedQuery.refetch();
    }, [feedQuery]);

    const loadMore = useCallback(async () => {
        if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
            await feedQuery.fetchNextPage();
        }
    }, [feedQuery]);

    return useMemo(
        () => ({
            posts,
            isLoading: feedQuery.isLoading,
            isLoadingMore: feedQuery.isFetchingNextPage,
            error: feedQuery.isError ? "Unable to load feed." : null,
            hasMore: Boolean(feedQuery.hasNextPage),
            loadInitial,
            loadMore,
            createPost,
            toggleLike,
            addComment,
        }),
        [
            addComment,
            createPost,
            feedQuery.hasNextPage,
            feedQuery.isError,
            feedQuery.isFetchingNextPage,
            feedQuery.isLoading,
            loadInitial,
            loadMore,
            posts,
            toggleLike,
        ],
    );
}

