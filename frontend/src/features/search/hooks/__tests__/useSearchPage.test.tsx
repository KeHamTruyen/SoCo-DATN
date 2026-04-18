import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useSearchPage } from "../useSearchPage";
import { searchApi } from "../../api/searchApi";
import { marketplaceApi } from "../../../marketplace/api/marketplaceApi";
import { feedApi } from "../../../feed/api/feedApi";

vi.mock("../../api/searchApi", () => ({
    searchApi: {
        search: vi.fn(),
    },
}));

vi.mock("../../../marketplace/api/marketplaceApi", () => ({
    marketplaceApi: {
        listProducts: vi.fn(),
    },
}));

vi.mock("../../../feed/api/feedApi", () => ({
    feedApi: {
        likePost: vi.fn(),
        addComment: vi.fn(),
        deletePost: vi.fn(),
    },
}));

vi.mock("../../../../shared/auth/useAuthSession", () => ({
    useAuthSession: () => ({
        user: {
            id: "u1",
            email: "u1@example.com",
            fullName: "User One",
        },
    }),
}));

vi.mock("../../../feed/utils/normalizeFeedPost", () => ({
    normalizeFeedPost: (item: Record<string, unknown>) => ({
        id: String(item.id ?? "post-1"),
        likedByMe: Boolean(item.likedByMe),
        likesCount: Number(item.likesCount ?? 0),
        commentsCount: Number(item.commentsCount ?? 0),
        comments: Array.isArray(item.comments) ? item.comments : [],
        content: String(item.content ?? ""),
        user: { id: "u1", fullName: "User One" },
    }),
}));

function wrapper(path = "/search?q=phone") {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/search" element={<>{children}</>} />
                </Routes>
            </MemoryRouter>
        );
    };
}

describe("useSearchPage", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("loads all-tab results and maps product fallback values", async () => {
        vi.mocked(searchApi.search).mockResolvedValue({
            products: { total: 1, items: [{ id: "p1", title: "Phone X" }] },
            users: { total: 0, items: [] },
            posts: { total: 0, items: [] },
        } as never);

        const { result } = renderHook(() => useSearchPage(), {
            wrapper: wrapper(),
        });

        await waitFor(() => expect(result.current.allProductItems.length).toBe(1));
        expect(searchApi.search).toHaveBeenCalledWith("phone", { limit: 5 });
        expect(result.current.allProductItems[0]).toEqual(
            expect.objectContaining({
                id: "p1",
                name: "Phone X",
                rating: 0,
                soldCount: 0,
                price: 0,
            }),
        );
    });

    it("switches to products tab and fetches marketplace list", async () => {
        vi.mocked(searchApi.search).mockResolvedValue({
            products: { total: 0, items: [] },
            users: { total: 0, items: [] },
            posts: { total: 0, items: [] },
        } as never);
        vi.mocked(marketplaceApi.listProducts).mockResolvedValue({
            items: [{ id: "p1", name: "Phone", price: 20 }],
            total: 1,
            page: 1,
            pageSize: 10,
        } as never);

        const { result } = renderHook(() => useSearchPage(), {
            wrapper: wrapper(),
        });

        act(() => {
            result.current.switchTab("products");
        });

        await waitFor(() =>
            expect(marketplaceApi.listProducts).toHaveBeenCalledWith(
                expect.objectContaining({
                    q: "phone",
                    page: 1,
                    pageSize: 10,
                }),
            ),
        );
    });

    it("uses posts filters when posts tab is active", async () => {
        vi.mocked(searchApi.search)
            .mockResolvedValueOnce({
                products: { total: 0, items: [] },
                users: { total: 0, items: [] },
                posts: { total: 0, items: [] },
            } as never)
            .mockResolvedValue({
                products: { total: 0, items: [] },
                users: { total: 0, items: [] },
                posts: {
                    total: 1,
                    items: [{ id: "post-1", content: "hello world" }],
                },
            } as never);

        const { result } = renderHook(() => useSearchPage(), {
            wrapper: wrapper(),
        });

        act(() => {
            result.current.switchTab("posts");
            result.current.setPostsSource("follower");
            result.current.setPostsFromDate("2026-01-02");
            result.current.setPostsToDate("2026-01-05");
        });

        await waitFor(() =>
            expect(searchApi.search).toHaveBeenLastCalledWith(
                "phone",
                expect.objectContaining({
                    types: ["posts"],
                    postsSource: "follower",
                    postedFrom: expect.any(String),
                    postedTo: expect.any(String),
                }),
            ),
        );
    });

    it("rolls back optimistic like when API fails", async () => {
        vi.mocked(searchApi.search)
            .mockResolvedValueOnce({
                products: { total: 0, items: [] },
                users: { total: 0, items: [] },
                posts: { total: 0, items: [] },
            } as never)
            .mockResolvedValue({
                products: { total: 0, items: [] },
                users: { total: 0, items: [] },
                posts: {
                    total: 1,
                    items: [{ id: "post-1", likedByMe: false, likesCount: 2 }],
                },
            } as never);
        vi.mocked(feedApi.likePost).mockRejectedValue(new Error("boom"));

        const { result } = renderHook(() => useSearchPage(), {
            wrapper: wrapper(),
        });

        act(() => {
            result.current.switchTab("posts");
        });
        await waitFor(() => expect(result.current.postItems.length).toBe(1));

        await act(async () => {
            await result.current.handleLikePost("post-1");
        });

        expect(result.current.postItems[0].likedByMe).toBe(false);
        expect(result.current.postItems[0].likesCount).toBe(2);
    });
});
