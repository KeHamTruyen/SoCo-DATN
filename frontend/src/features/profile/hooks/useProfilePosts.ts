import { useCallback, useEffect, useState } from "react";
import { feedApi } from "../../feed/api/feedApi";
import type { CreatePostPayload, FeedComment, FeedPost } from "../../feed/types/feed.types";
import type { PublicUserProfile } from "../types/profile.types";
import { PROFILE_POST_PAGE_SIZE } from "../constants/profilePageConstants";
import type { UserProfile } from "../../auth/types/auth.types";

export function useProfilePosts(
    profile: PublicUserProfile | null,
    user: UserProfile | null,
    setProfile: React.Dispatch<React.SetStateAction<PublicUserProfile | null>>
) {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [postsPage, setPostsPage] = useState(1);
    const [postsHasMore, setPostsHasMore] = useState(false);
    const [postsLoadingMore, setPostsLoadingMore] = useState(false);

    // Initial load
    useEffect(() => {
        let mounted = true;
        if (!profile) {
            setPosts([]);
            setPostsPage(1);
            setPostsHasMore(false);
            return;
        }

        void (async () => {
            try {
                const postsData = await feedApi.listUserPosts(
                    profile.id,
                    1,
                    PROFILE_POST_PAGE_SIZE
                );
                if (!mounted) return;
                setPosts(postsData.items);
                setPostsHasMore(Boolean(postsData.nextCursor));
                setPostsPage(1);
            } catch {
                if (!mounted) return;
                setPosts([]);
                setPostsHasMore(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [profile?.id]); // Note: We only want this to run when profile changes, not on every render. Using profile?.id avoids infinite loops if profile object is recreated.

    const loadMorePosts = useCallback(async () => {
        if (!profile || !postsHasMore || postsLoadingMore) return;
        setPostsLoadingMore(true);
        try {
            const nextPage = postsPage + 1;
            const res = await feedApi.listUserPosts(
                profile.id,
                nextPage,
                PROFILE_POST_PAGE_SIZE
            );
            setPosts((prev) => [...prev, ...res.items]);
            setPostsPage(nextPage);
            setPostsHasMore(Boolean(res.nextCursor));
        } catch {
            setPostsHasMore(false);
        } finally {
            setPostsLoadingMore(false);
        }
    }, [profile, postsHasMore, postsLoadingMore, postsPage]);

    const handleProfileCreatePost = useCallback(
        async (payload: CreatePostPayload) => {
            if (payload.scheduledAt) {
                await feedApi.createScheduledPost(payload);
            } else {
                const created = await feedApi.createPost(payload);
                if (profile && user?.id === profile.id) {
                    setPosts((prev) => [created, ...prev]);
                    setProfile((p) =>
                        p
                            ? {
                                  ...p,
                                  postsCount: (p.postsCount ?? 0) + 1,
                              }
                            : p
                    );
                }
            }
        },
        [profile, user?.id, setProfile]
    );

    const handleProfileModalLike = useCallback(async (postId: string) => {
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
                    : post
            )
        );
        try {
            const updated = await feedApi.likePost(postId);
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId ? { ...post, ...updated } : post
                )
            );
        } catch {
            // Revert on error
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
                        : post
                )
            );
        }
    }, []);

    const handleProfileModalComment = useCallback(
        async (postId: string, content: string) => {
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

            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              commentsCount: post.commentsCount + 1,
                              comments: [optimistic, ...(post.comments ?? [])],
                          }
                        : post
                )
            );

            try {
                const created = await feedApi.addComment(postId, content);
                setPosts((prev) =>
                    prev.map((post) =>
                        post.id === postId
                            ? {
                                  ...post,
                                  comments: (post.comments ?? []).map(
                                      (comment) =>
                                          comment.id === optimistic.id
                                              ? created
                                              : comment
                                  ),
                              }
                            : post
                    )
                );
            } catch {
                setPosts((prev) =>
                    prev.map((post) =>
                        post.id === postId
                            ? {
                                  ...post,
                                  commentsCount: Math.max(
                                      0,
                                      post.commentsCount - 1
                                  ),
                                  comments: (post.comments ?? []).filter(
                                      (comment) => comment.id !== optimistic.id
                                  ),
                              }
                            : post
                    )
                );
            }
        },
        [user]
    );

    return {
        posts,
        setPosts,
        postsPage,
        postsHasMore,
        postsLoadingMore,
        loadMorePosts,
        handleProfileCreatePost,
        handleProfileModalLike,
        handleProfileModalComment
    };
}
