import { renderHook, act, waitFor } from "@testing-library/react";
import { usePostCommentsPagination } from "../usePostCommentsPagination";
import { feedApi } from "../../api/feedApi";

vi.mock("../../api/feedApi", () => ({
    feedApi: {
        getComments: vi.fn(),
    },
}));

describe("usePostCommentsPagination", () => {
    beforeEach(() => {
        vi.mocked(feedApi.getComments).mockReset();
    });

    it("hasMore false when disabled", () => {
        const { result } = renderHook(() =>
            usePostCommentsPagination({
                postId: "p1",
                embeddedCommentCount: 0,
                commentsCount: 10,
                enabled: false,
            }),
        );
        expect(result.current.hasMore).toBe(false);
    });

    it("hasMore false when all comments loaded", () => {
        const { result } = renderHook(() =>
            usePostCommentsPagination({
                postId: "p1",
                embeddedCommentCount: 3,
                commentsCount: 3,
            }),
        );
        expect(result.current.hasMore).toBe(false);
    });

    it("hasMore true when more comments exist than embedded", () => {
        const { result } = renderHook(() =>
            usePostCommentsPagination({
                postId: "p1",
                embeddedCommentCount: 1,
                commentsCount: 5,
            }),
        );
        expect(result.current.hasMore).toBe(true);
    });

    it("resets older comments when postId changes", async () => {
        vi.mocked(feedApi.getComments).mockResolvedValue({
            items: [
                { id: "c1", content: "a", createdAt: "", user: { id: "u", email: "e", fullName: "F", role: "buyer" } },
            ],
        } as never);

        const { result, rerender } = renderHook(
            ({ postId }: { postId: string }) =>
                usePostCommentsPagination({
                    postId,
                    embeddedCommentCount: 0,
                    commentsCount: 10,
                }),
            { initialProps: { postId: "p1" } },
        );

        await act(async () => {
            await result.current.loadMoreComments();
        });
        await waitFor(() => expect(result.current.olderComments.length).toBeGreaterThan(0));

        rerender({ postId: "p2" });
        expect(result.current.olderComments).toEqual([]);
    });

    it("loadMoreComments appends reversed page and advances", async () => {
        vi.mocked(feedApi.getComments).mockResolvedValue({
            items: [
                { id: "c2", content: "second", createdAt: "t2", user: { id: "u", email: "e", fullName: "F", role: "buyer" } },
                { id: "c1", content: "first", createdAt: "t1", user: { id: "u", email: "e", fullName: "F", role: "buyer" } },
            ],
        } as never);

        const { result } = renderHook(() =>
            usePostCommentsPagination({
                postId: "p1",
                embeddedCommentCount: 0,
                commentsCount: 5,
                pageSize: 5,
            }),
        );

        await act(async () => {
            await result.current.loadMoreComments();
        });

        await waitFor(() => {
            expect(feedApi.getComments).toHaveBeenCalledWith("p1", 2, 5, 0);
            expect(result.current.olderComments.map((c) => c.id)).toEqual(["c1", "c2"]);
        });
    });

    it("loadMoreComments is no-op when hasMore is false", async () => {
        const { result } = renderHook(() =>
            usePostCommentsPagination({
                postId: "p1",
                embeddedCommentCount: 5,
                commentsCount: 5,
            }),
        );

        await act(async () => {
            await result.current.loadMoreComments();
        });

        expect(feedApi.getComments).not.toHaveBeenCalled();
    });
});
