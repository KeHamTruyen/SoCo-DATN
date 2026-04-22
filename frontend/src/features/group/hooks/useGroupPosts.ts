import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupApi } from "../../group/api/groupApi";
import { feedApi } from "../../feed/api/feedApi";
import type { FeedComment, FeedPost, CreatePostPayload } from "../../feed/types/feed.types";
import { queryKeys } from "../../../shared/query/queryKeys";

interface UseGroupPostsOptions {
    isAuthenticated: boolean;
    onAuthRequired: () => void;
}

export function useGroupPosts(
    id: string | undefined,
    activeTab: string,
    { isAuthenticated, onAuthRequired }: UseGroupPostsOptions,
) {
    const queryClient = useQueryClient();
    const groupPostsKey = id ? queryKeys.group.posts(id) : ["group", "posts", "empty"];
    const shouldFetch = Boolean(id) && activeTab === "discussion";

    const groupPostsQuery = useQuery({
        queryKey: groupPostsKey,
        enabled: shouldFetch,
        queryFn: async () => {
            const res = await groupApi.getGroupPosts(id!);
            return res.items;
        },
    });

    const createPostMutation = useMutation({
        mutationFn: (payload: CreatePostPayload) => groupApi.createGroupPost(id!, payload),
        onSuccess(created) {
            queryClient.setQueryData<FeedPost[]>(groupPostsKey, (prev = []) => [created, ...prev]);
        },
    });

    const likeMutation = useMutation({
        mutationFn: (postId: string) => feedApi.likePost(postId),
    });

    const addCommentMutation = useMutation({
        mutationFn: ({ postId, content }: { postId: string; content: string }) =>
            feedApi.addComment(postId, content),
    });

    const deletePostMutation = useMutation({
        mutationFn: (postId: string) => feedApi.deletePost(postId),
        onSuccess(_, postId) {
            queryClient.setQueryData<FeedPost[]>(
                groupPostsKey,
                (prev = []) => prev.filter((post) => post.id !== postId),
            );
        },
    });

    const handleCreatePost = async (payload: CreatePostPayload) => {
        if (!isAuthenticated) {
            onAuthRequired();
            return;
        }
        if (!id) return;
        await createPostMutation.mutateAsync(payload);
    };

    const handleLike = async (postId: string) => {
        if (!isAuthenticated) {
            onAuthRequired();
            return;
        }
        const previousData = queryClient.getQueryData<FeedPost[]>(groupPostsKey);
        queryClient.setQueryData<FeedPost[]>(
            groupPostsKey,
            (prev = []) =>
                prev.map((p) =>
                    p.id === postId
                        ? {
                              ...p,
                              likedByMe: !p.likedByMe,
                              likesCount: p.likesCount + (p.likedByMe ? -1 : 1),
                          }
                        : p,
                ),
        );
        try {
            await likeMutation.mutateAsync(postId);
        } catch {
            queryClient.setQueryData(groupPostsKey, previousData);
        }
    };

    const handleComment = async (postId: string, content: string) => {
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
        const previousData = queryClient.getQueryData<FeedPost[]>(groupPostsKey);
        queryClient.setQueryData<FeedPost[]>(
            groupPostsKey,
            (prev = []) =>
                prev.map((p) =>
                    p.id === postId
                        ? {
                              ...p,
                              commentsCount: p.commentsCount + 1,
                              comments: [optimistic, ...(p.comments ?? [])],
                          }
                        : p,
                ),
        );
        try {
            const created = await addCommentMutation.mutateAsync({ postId, content });
            queryClient.setQueryData<FeedPost[]>(
                groupPostsKey,
                (prev = []) =>
                    prev.map((p) =>
                        p.id === postId
                            ? {
                                  ...p,
                                  comments: (p.comments ?? []).map((comment) =>
                                      comment.id === optimistic.id ? created : comment,
                                  ),
                              }
                            : p,
                    ),
            );
        } catch {
            queryClient.setQueryData(groupPostsKey, previousData);
        }
    };

    const handleDeletePost = async (targetPostId: string) => {
        await deletePostMutation.mutateAsync(targetPostId);
    };

    return {
        posts: groupPostsQuery.data ?? [],
        postsLoading: groupPostsQuery.isLoading,
        handleCreatePost,
        handleLike,
        handleComment,
        handleDeletePost,
    };
}
