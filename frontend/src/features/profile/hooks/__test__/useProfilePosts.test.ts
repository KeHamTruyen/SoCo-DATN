import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useProfilePosts } from "../useProfilePosts";
import type { PublicUserProfile } from "../../types/profile.types";
import type { FeedPost } from "../../../feed/types/feed.types";
vi.mock("../../../feed/api/feedApi", () => ({
    feedApi: {
        listUserPosts: vi.fn(),
        createPost: vi.fn(),
        createScheduledPost: vi.fn(),
        likePost: vi.fn(),
        addComment: vi.fn(),
    },
}));

import { feedApi } from "../../../feed/api/feedApi";

let testQueryClient: QueryClient;

function createWrapper() {
    testQueryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                refetchOnWindowFocus: false,
                staleTime: Infinity,
            },
            mutations: { retry: false },
        },
    });
    return function Wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client: testQueryClient }, children);
    };
}

function makePost(overrides: Partial<FeedPost> = {}): FeedPost {
    return {
        id: "p1",
        content: "c",
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        likedByMe: false,
        author: { id: "u1", email: "e", fullName: "F", role: "buyer" },
        ...overrides,
    };
}

const profile: PublicUserProfile = {
    id: "u1",
    role: "buyer",
    fullName: "U",
    postsCount: 1,
} as PublicUserProfile;

describe("useProfilePosts", () => {
    const onAuthRequired = vi.fn();
    const user = { id: "u1", email: "e", fullName: "F", role: "buyer" as const };

    beforeEach(() => {
        onAuthRequired.mockReset();
        vi.mocked(feedApi.listUserPosts).mockReset();
        vi.mocked(feedApi.createPost).mockReset();
        vi.mocked(feedApi.likePost).mockReset();
        vi.mocked(feedApi.addComment).mockReset();
        vi.mocked(feedApi.listUserPosts).mockResolvedValue({
            items: [makePost()],
            nextCursor: null,
        });
    });

    it("loads posts for profile id", async () => {
        const { result } = renderHook(
            () =>
                useProfilePosts(profile, user, vi.fn(), {
                    isAuthenticated: true,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));
        expect(feedApi.listUserPosts).toHaveBeenCalled();
    });

    it("handleProfileCreatePost calls onAuthRequired when guest", async () => {
        const setProfile = vi.fn();
        const { result } = renderHook(
            () =>
                useProfilePosts(profile, user, setProfile, {
                    isAuthenticated: false,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        await act(async () => {
            await result.current.handleProfileCreatePost({ content: "x" });
        });

        expect(onAuthRequired).toHaveBeenCalled();
        expect(feedApi.createPost).not.toHaveBeenCalled();
    });

    it("handleProfileCreatePost prepends to cache for self profile", async () => {
        const created = makePost({ id: "new" });
        vi.mocked(feedApi.createPost).mockResolvedValue(created);
        const setProfile = vi.fn();
        const { result } = renderHook(
            () =>
                useProfilePosts(profile, user, setProfile, {
                    isAuthenticated: true,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        await act(async () => {
            await result.current.handleProfileCreatePost({ content: "x" });
        });

        await waitFor(() => expect(result.current.posts[0].id).toBe("new"));
        expect(setProfile).toHaveBeenCalled();
    });

    it("handleProfileModalLike rolls back on API error", async () => {
        vi.mocked(feedApi.likePost).mockRejectedValue(new Error("x"));
        const { result } = renderHook(
            () =>
                useProfilePosts(profile, user, vi.fn(), {
                    isAuthenticated: true,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));
        const liked = result.current.posts[0].likedByMe;

        await act(async () => {
            await result.current.handleProfileModalLike("p1");
        });

        expect(result.current.posts[0].likedByMe).toBe(liked);
    });

    it("setPosts replaces query data", async () => {
        const { result } = renderHook(
            () =>
                useProfilePosts(profile, user, vi.fn(), {
                    isAuthenticated: true,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        act(() => {
            result.current.setPosts([makePost({ id: "only" })]);
        });

        await waitFor(() => {
            expect(result.current.posts).toHaveLength(1);
            expect(result.current.posts[0].id).toBe("only");
        });
    });
});
