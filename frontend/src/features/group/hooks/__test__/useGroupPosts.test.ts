import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGroupPosts } from "../useGroupPosts";
import type { FeedPost } from "../../../feed/types/feed.types";
import { queryKeys } from "../../../../shared/query/queryKeys";

vi.mock("../../api/groupApi", () => ({
    groupApi: {
        getGroupPosts: vi.fn(),
        createGroupPost: vi.fn(),
    },
}));

vi.mock("../../../feed/api/feedApi", () => ({
    feedApi: {
        likePost: vi.fn(),
        addComment: vi.fn(),
        deletePost: vi.fn(),
    },
}));

import { groupApi } from "../../api/groupApi";
import { feedApi } from "../../../feed/api/feedApi";

let testQueryClient: QueryClient;

function createWrapper() {
    testQueryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return function Wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client: testQueryClient }, children);
    };
}

function makePost(overrides: Partial<FeedPost> = {}): FeedPost {
    return {
        id: "gp1",
        content: "x",
        createdAt: new Date().toISOString(),
        likesCount: 1,
        commentsCount: 0,
        likedByMe: false,
        author: { id: "u1", email: "e", fullName: "F", role: "buyer" },
        ...overrides,
    };
}

describe("useGroupPosts", () => {
    const onAuthRequired = vi.fn();
    const groupPostsKey = queryKeys.group.posts("g1");

    beforeEach(() => {
        onAuthRequired.mockReset();
        vi.mocked(groupApi.getGroupPosts).mockReset();
        vi.mocked(groupApi.createGroupPost).mockReset();
        vi.mocked(feedApi.likePost).mockReset();
        vi.mocked(feedApi.addComment).mockReset();
        vi.mocked(feedApi.deletePost).mockReset();
        vi.mocked(groupApi.getGroupPosts).mockResolvedValue({ items: [makePost()], nextCursor: null });
    });

    it("does not fetch when activeTab is not discussion", () => {
        renderHook(
            () =>
                useGroupPosts("g1", "members", {
                    isAuthenticated: true,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );
        expect(groupApi.getGroupPosts).not.toHaveBeenCalled();
    });

    it("loads posts when tab is discussion", async () => {
        const { result } = renderHook(
            () =>
                useGroupPosts("g1", "discussion", {
                    isAuthenticated: true,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));
        expect(groupApi.getGroupPosts).toHaveBeenCalledWith("g1");
    });

    it("handleCreatePost calls onAuthRequired when guest", async () => {
        const { result } = renderHook(
            () =>
                useGroupPosts("g1", "discussion", {
                    isAuthenticated: false,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        await act(async () => {
            await result.current.handleCreatePost({ content: "c" });
        });

        expect(onAuthRequired).toHaveBeenCalled();
        expect(groupApi.createGroupPost).not.toHaveBeenCalled();
    });

    it("handleCreatePost prepends post in cache", async () => {
        const created = makePost({ id: "new" });
        vi.mocked(groupApi.createGroupPost).mockResolvedValue(created);
        const { result } = renderHook(
            () =>
                useGroupPosts("g1", "discussion", {
                    isAuthenticated: true,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        await act(async () => {
            await result.current.handleCreatePost({ content: "c" });
        });

        await waitFor(() => expect(result.current.posts[0].id).toBe("new"));
        const cached = testQueryClient.getQueryData<FeedPost[]>(groupPostsKey);
        expect(cached?.[0].id).toBe("new");
    });

    it("handleLike rolls back when API fails", async () => {
        vi.mocked(feedApi.likePost).mockRejectedValue(new Error("x"));
        const { result } = renderHook(
            () =>
                useGroupPosts("g1", "discussion", {
                    isAuthenticated: true,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));
        const likedBefore = result.current.posts[0].likedByMe;

        await act(async () => {
            await result.current.handleLike("gp1");
        });

        expect(result.current.posts[0].likedByMe).toBe(likedBefore);
    });

    it("handleDeletePost removes from cache", async () => {
        vi.mocked(feedApi.deletePost).mockResolvedValue(undefined as never);
        const { result } = renderHook(
            () =>
                useGroupPosts("g1", "discussion", {
                    isAuthenticated: true,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.posts).toHaveLength(1));

        await act(async () => {
            await result.current.handleDeletePost("gp1");
        });

        await waitFor(() => expect(result.current.posts).toHaveLength(0));
    });
});
