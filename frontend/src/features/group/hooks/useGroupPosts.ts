import { useState, useCallback, useEffect } from "react";
import { groupApi } from "../../group/api/groupApi";
import { feedApi } from "../../feed/api/feedApi";
import type { FeedPost, CreatePostPayload } from "../../feed/types/feed.types";

interface UseGroupPostsOptions {
    isAuthenticated: boolean;
    onAuthRequired: () => void;
}

export function useGroupPosts(
    id: string | undefined,
    activeTab: string,
    { isAuthenticated, onAuthRequired }: UseGroupPostsOptions,
) {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);

    const fetchPosts = useCallback(async () => {
        if (!id || activeTab !== "discussion") return;
        setPostsLoading(true);
        try {
            const res = await groupApi.getGroupPosts(id);
            setPosts(res.items);
        } catch {
            setPosts([]);
        } finally {
            setPostsLoading(false);
        }
    }, [id, activeTab]);

    useEffect(() => {
        void fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = async (payload: CreatePostPayload) => {
        if (!isAuthenticated) {
            onAuthRequired();
            return;
        }
        if (!id) return;
        await groupApi.createGroupPost(id, payload);
        void fetchPosts();
    };

    const handleLike = async (postId: string) => {
        if (!isAuthenticated) {
            onAuthRequired();
            return;
        }
        await feedApi.likePost(postId);
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) }
                    : p,
            ),
        );
    };

    const handleComment = async (postId: string, content: string) => {
        if (!isAuthenticated) {
            onAuthRequired();
            return;
        }
        await feedApi.addComment(postId, content);
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p,
            ),
        );
    };

    const handleDeletePost = async (targetPostId: string) => {
        await feedApi.deletePost(targetPostId);
        setPosts((prev) => prev.filter((p) => p.id !== targetPostId));
    };

    return {
        posts,
        postsLoading,
        handleCreatePost,
        handleLike,
        handleComment,
        handleDeletePost,
    };
}
