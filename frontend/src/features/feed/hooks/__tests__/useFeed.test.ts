import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFeed } from "../useFeed";
import { queryKeys } from "../../../../shared/query/queryKeys";
import type { FeedPost } from "../../types/feed.types";

vi.mock("../../api/feedApi", () => ({
    feedApi: {
        listPosts: vi.fn(),
        createPost: vi.fn(),
        likePost: vi.fn(),
        addComment: vi.fn(),
    },
}));

import { feedApi } from "../../api/feedApi";

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
        id: "post-1",
        content: "hello",
        createdAt: new Date().toISOString(),
        likesCount: 2,
        commentsCount: 0,
        likedByMe: false,
        author: {
            id: "u1",
            email: "u@u.com",
            fullName: "User",
            role: "buyer",
        },
        ...overrides,
    };
}

describe("useFeed", () => {
    const feedKey = queryKeys.feed.list("home");
    const onAuthRequired = vi.fn();

    beforeEach(() => {
        onAuthRequired.mockReset();
        vi.mocked(feedApi.listPosts).mockReset();
        vi.mocked(feedApi.createPost).mockReset();
        vi.mocked(feedApi.likePost).mockReset();
        vi.mocked(feedApi.addComment).mockReset();
        vi.mocked(feedApi.listPosts).mockResolvedValue({ items: [makePost()], nextCursor: null });
    });

    it("loads posts from infinite query", async () => {
        const { result } = renderHook(
            () => useFeed({ isAuthenticated: true, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => {
            expect(result.current.posts).toHaveLength(1);
            expect(result.current.posts[0].id).toBe("post-1");
        });
        expect(feedApi.listPosts).toHaveBeenCalledWith(undefined);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("surfaces error state when listPosts fails", async () => {
        vi.mocked(feedApi.listPosts).mockRejectedValue(new Error("network"));
        const { result } = renderHook(
            () => useFeed({ isAuthenticated: true, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => {
            expect(result.current.error).toBe("Unable to load feed.");
        });
    });

    it("createPost when unauthenticated calls onAuthRequired and skips API", async () => {
        const { result } = renderHook(
            () => useFeed({ isAuthenticated: false, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        await act(async () => {
            await result.current.createPost({ content: "x" });
        });

        expect(onAuthRequired).toHaveBeenCalled();
        expect(feedApi.createPost).not.toHaveBeenCalled();
    });

    it("createPost prepends new post to cache on success", async () => {
        const created = makePost({ id: "new-post", content: "new" });
        vi.mocked(feedApi.createPost).mockResolvedValue(created);
        const { result } = renderHook(
            () => useFeed({ isAuthenticated: true, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        await act(async () => {
            await result.current.createPost({ content: "new" });
        });

        await waitFor(() => {
            expect(result.current.posts[0].id).toBe("new-post");
            expect(result.current.posts).toHaveLength(2);
        });
        const cached = testQueryClient.getQueryData(feedKey) as {
            pages: Array<{ items: FeedPost[] }>;
        };
        expect(cached.pages[0].items[0].id).toBe("new-post");
    });

    it("toggleLike when unauthenticated calls onAuthRequired", async () => {
        const { result } = renderHook(
            () => useFeed({ isAuthenticated: false, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        await act(async () => {
            await result.current.toggleLike("post-1");
        });

        expect(onAuthRequired).toHaveBeenCalled();
        expect(feedApi.likePost).not.toHaveBeenCalled();
    });

    it("toggleLike optimistically toggles and calls API when authenticated", async () => {
        vi.mocked(feedApi.likePost).mockResolvedValue(undefined as never);
        const { result } = renderHook(
            () => useFeed({ isAuthenticated: true, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts[0].likedByMe).toBe(false));

        await act(async () => {
            await result.current.toggleLike("post-1");
        });

        expect(feedApi.likePost).toHaveBeenCalledWith("post-1");
        await waitFor(() => {
            expect(result.current.posts[0].likedByMe).toBe(true);
            expect(result.current.posts[0].likesCount).toBe(3);
        });
    });

    it("toggleLike rolls back cache when like API fails", async () => {
        vi.mocked(feedApi.likePost).mockRejectedValue(new Error("fail"));
        const { result } = renderHook(
            () => useFeed({ isAuthenticated: true, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));
        const beforeLiked = result.current.posts[0].likedByMe;
        const beforeCount = result.current.posts[0].likesCount;

        await act(async () => {
            await result.current.toggleLike("post-1");
        });

        expect(result.current.posts[0].likedByMe).toBe(beforeLiked);
        expect(result.current.posts[0].likesCount).toBe(beforeCount);
    });

    it("addComment when unauthenticated calls onAuthRequired", async () => {
        const { result } = renderHook(
            () => useFeed({ isAuthenticated: false, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        await act(async () => {
            await result.current.addComment("post-1", "hi");
        });

        expect(onAuthRequired).toHaveBeenCalled();
        expect(feedApi.addComment).not.toHaveBeenCalled();
    });

    it("addComment replaces optimistic comment with server comment", async () => {
        const serverComment = {
            id: "c-real",
            content: "hi",
            createdAt: new Date().toISOString(),
            user: { id: "u1", email: "u@u.com", fullName: "User", role: "buyer" as const },
        };
        vi.mocked(feedApi.addComment).mockResolvedValue(serverComment as never);
        const { result } = renderHook(
            () => useFeed({ isAuthenticated: true, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        await act(async () => {
            await result.current.addComment("post-1", "hi");
        });

        await waitFor(() => {
            const comments = result.current.posts[0].comments ?? [];
            expect(comments.some((c) => c.id === "c-real")).toBe(true);
            expect(comments.some((c) => c.id.startsWith("temp-"))).toBe(false);
            expect(result.current.posts[0].commentsCount).toBeGreaterThanOrEqual(1);
        });
    });

    it("addComment rolls back when API fails", async () => {
        vi.mocked(feedApi.addComment).mockRejectedValue(new Error("fail"));
        const { result } = renderHook(
            () => useFeed({ isAuthenticated: true, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));
        const beforeCount = result.current.posts[0].commentsCount;

        await act(async () => {
            await result.current.addComment("post-1", "hi");
        });

        expect(result.current.posts[0].commentsCount).toBe(beforeCount);
        expect(result.current.posts[0].comments ?? []).toHaveLength(0);
    });

    it("loadMore fetches next page when hasMore", async () => {
        vi.mocked(feedApi.listPosts)
            .mockResolvedValueOnce({
                items: [makePost({ id: "p1" })],
                nextCursor: "cur2",
            })
            .mockResolvedValueOnce({
                items: [makePost({ id: "p2" })],
                nextCursor: null,
            });

        const { result } = renderHook(
            () => useFeed({ isAuthenticated: true, onAuthRequired }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.hasMore).toBe(true));

        await act(async () => {
            await result.current.loadMore();
        });

        await waitFor(() => {
            expect(result.current.posts.map((p) => p.id)).toEqual(["p1", "p2"]);
            expect(result.current.hasMore).toBe(false);
        });
        expect(feedApi.listPosts).toHaveBeenLastCalledWith("cur2");
    });
});
