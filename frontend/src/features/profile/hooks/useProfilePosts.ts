import { useCallback, useMemo } from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { feedApi } from "../../feed/api/feedApi";
import type { CreatePostPayload, FeedComment, FeedPost } from "../../feed/types/feed.types";
import type { PublicUserProfile } from "../types/profile.types";
import { PROFILE_POST_PAGE_SIZE } from "../constants/profilePageConstants";
import type { UserProfile } from "../../auth/types/auth.types";
import { queryKeys } from "../../../shared/query/queryKeys";

interface ProfileAuthOptions {
    isAuthenticated?: boolean;
    onAuthRequired?: () => void;
}

export function useProfilePosts(
    profile: PublicUserProfile | null,
    user: UserProfile | null,
    setProfile: React.Dispatch<React.SetStateAction<PublicUserProfile | null>>,
    { isAuthenticated = true, onAuthRequired = () => {} }: ProfileAuthOptions = {},
) {
    const queryClient = useQueryClient();
    const profileId = profile?.id;
    const profilePostsKey = profileId
        ? queryKeys.feed.userPosts(profileId)
        : ["feed", "userPosts", "empty"];

    const postsQuery = useInfiniteQuery({
        queryKey: profilePostsKey,
        enabled: Boolean(profileId),
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            feedApi.listUserPosts(profileId!, pageParam, PROFILE_POST_PAGE_SIZE),
        getNextPageParam: (lastPage) =>
            lastPage.nextCursor ? Number(lastPage.nextCursor) : undefined,
    });

    const createPostMutation = useMutation({
        mutationFn: (payload: CreatePostPayload) => {
            if (payload.scheduledAt) {
                return feedApi.createScheduledPost(payload);
            }
            return feedApi.createPost(payload);
        },
    });

    const likeMutation = useMutation({
        mutationFn: (postId: string) => feedApi.likePost(postId),
    });

    const addCommentMutation = useMutation({
        mutationFn: ({ postId, content }: { postId: string; content: string }) =>
            feedApi.addComment(postId, content),
    });

    const loadMorePosts = useCallback(async () => {
        if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
            await postsQuery.fetchNextPage();
        }
    }, [postsQuery]);

    const handleProfileCreatePost = useCallback(
        async (payload: CreatePostPayload) => {
            if (!isAuthenticated) {
                onAuthRequired();
                return;
            }
            const created = await createPostMutation.mutateAsync(payload);
            if (!payload.scheduledAt && profile && user?.id === profile.id) {
                queryClient.setQueryData(
                    profilePostsKey,
                    (old:
                        | {
                              pages: Array<{ items: FeedPost[]; nextCursor: string | null }>;
                              pageParams: number[];
                          }
                        | undefined) => {
                        if (!old || old.pages.length === 0) {
                            return {
                                pages: [{ items: [created], nextCursor: null }],
                                pageParams: [1],
                            };
                        }
                        const [firstPage, ...restPages] = old.pages;
                        return {
                            ...old,
                            pages: [
                                { ...firstPage, items: [created, ...firstPage.items] },
                                ...restPages,
                            ],
                        };
                    },
                );
                setProfile((p) =>
                    p
                        ? {
                              ...p,
                              postsCount: (p.postsCount ?? 0) + 1,
                          }
                        : p,
                );
            }
        },
        [createPostMutation, isAuthenticated, onAuthRequired, profile, profilePostsKey, queryClient, setProfile, user?.id],
    );

    const handleProfileModalLike = useCallback(async (postId: string) => {
        if (!isAuthenticated) {
            onAuthRequired();
            return;
        }
        const previousData = queryClient.getQueryData(profilePostsKey);
        queryClient.setQueryData(
            profilePostsKey,
            (old:
                | {
                      pages: Array<{ items: FeedPost[]; nextCursor: string | null }>;
                      pageParams: number[];
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
            queryClient.setQueryData(profilePostsKey, previousData);
        }
    }, [isAuthenticated, likeMutation, onAuthRequired, profilePostsKey, queryClient]);

    const handleProfileModalComment = useCallback(
        async (postId: string, content: string) => {
            if (!isAuthenticated) {
                onAuthRequired();
                return;
            }
            const optimistic: FeedComment = {
                id: `temp-${Date.now()}`,
                content,
                createdAt: new Date().toISOString(),
                user: {
                    id: user?.id ?? "me",
                    email: user?.email ?? "me@local",
                    fullName: user?.fullName,
                    username: user?.username,
                    avatarUrl: user?.avatarUrl,
                    role: user?.role,
                },
            };

            const previousData = queryClient.getQueryData(profilePostsKey);
            queryClient.setQueryData(
                profilePostsKey,
                (old:
                    | {
                          pages: Array<{ items: FeedPost[]; nextCursor: string | null }>;
                          pageParams: number[];
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
                    profilePostsKey,
                    (old:
                        | {
                              pages: Array<{ items: FeedPost[]; nextCursor: string | null }>;
                              pageParams: number[];
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
                                                  comment.id === optimistic.id
                                                      ? created
                                                      : comment,
                                              ),
                                          }
                                        : post,
                                ),
                            })),
                        };
                    },
                );
            } catch {
                queryClient.setQueryData(profilePostsKey, previousData);
            }
        },
        [addCommentMutation, isAuthenticated, onAuthRequired, profilePostsKey, queryClient, user],
    );

    const posts = useMemo(
        () => postsQuery.data?.pages.flatMap((page) => page.items) ?? [],
        [postsQuery.data],
    );
    const setPosts: React.Dispatch<React.SetStateAction<FeedPost[]>> = useCallback(
        (value) => {
            queryClient.setQueryData(
                profilePostsKey,
                (old:
                    | {
                          pages: Array<{ items: FeedPost[]; nextCursor: string | null }>;
                          pageParams: number[];
                      }
                    | undefined) => {
                    const current = old?.pages.flatMap((page) => page.items) ?? [];
                    const nextItems = typeof value === "function" ? value(current) : value;
                    return {
                        pages: [{ items: nextItems, nextCursor: null }],
                        pageParams: [1],
                    };
                },
            );
        },
        [profilePostsKey, queryClient],
    );

    return {
        posts,
        setPosts,
        postsPage: postsQuery.data?.pages.length ?? 1,
        postsHasMore: Boolean(postsQuery.hasNextPage),
        postsLoadingMore: postsQuery.isFetchingNextPage,
        loadMorePosts,
        handleProfileCreatePost,
        handleProfileModalLike,
        handleProfileModalComment
    };
}
