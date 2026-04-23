import { renderHook, act, waitFor } from "@testing-library/react";
import { useSavedPostItem } from "../useSavedPostItem";
import { savedItemsApi } from "../../../saved-items/api/savedItemsApi";
import type { SavedItemType } from "../../../saved-items/types/savedItems.types";

const savedRow = (id: string, targetId: string) => ({
    id,
    itemType: "POST" as SavedItemType,
    targetId,
    createdAt: new Date().toISOString(),
});

vi.mock("../../../saved-items/api/savedItemsApi", () => ({
    savedItemsApi: {
        lookup: vi.fn(),
        save: vi.fn(),
        remove: vi.fn(),
    },
}));

describe("useSavedPostItem", () => {
    beforeEach(() => {
        vi.mocked(savedItemsApi.lookup).mockReset();
        vi.mocked(savedItemsApi.save).mockReset();
        vi.mocked(savedItemsApi.remove).mockReset();
    });

    it("loads savedId from lookup on mount", async () => {
        vi.mocked(savedItemsApi.lookup).mockResolvedValue("row-1");
        const { result } = renderHook(() => useSavedPostItem("post-99"));

        await waitFor(() => {
            expect(savedItemsApi.lookup).toHaveBeenCalledWith("POST", "post-99");
            expect(result.current.savedId).toBe("row-1");
        });
    });

    it("sets savedId null when lookup fails", async () => {
        vi.mocked(savedItemsApi.lookup).mockRejectedValue(new Error("x"));
        const { result } = renderHook(() => useSavedPostItem("post-1"));

        await waitFor(() => {
            expect(result.current.savedId).toBeNull();
        });
    });

    it("toggleSave removes when already saved", async () => {
        vi.mocked(savedItemsApi.lookup).mockResolvedValue("row-1");
        vi.mocked(savedItemsApi.remove).mockResolvedValue(undefined as never);

        const { result } = renderHook(() => useSavedPostItem("post-1"));

        await waitFor(() => expect(result.current.savedId).toBe("row-1"));

        await act(async () => {
            result.current.toggleSave();
        });
        await waitFor(() => {
            expect(savedItemsApi.remove).toHaveBeenCalledWith("row-1");
            expect(result.current.savedId).toBeNull();
            expect(result.current.saveBusy).toBe(false);
        });
    });

    it("toggleSave saves when not saved", async () => {
        vi.mocked(savedItemsApi.lookup).mockResolvedValue(null as never);
        vi.mocked(savedItemsApi.save).mockResolvedValue(savedRow("new-row", "post-1"));

        const { result } = renderHook(() => useSavedPostItem("post-1"));

        await waitFor(() => expect(result.current.savedId).toBeNull());

        await act(async () => {
            result.current.toggleSave();
        });
        await waitFor(() => {
            expect(savedItemsApi.save).toHaveBeenCalledWith("POST", "post-1");
            expect(result.current.savedId).toBe("new-row");
        });
    });

    it("toggleSave ignores second call while busy", async () => {
        vi.mocked(savedItemsApi.lookup).mockResolvedValue(null as never);
        type SaveResult = Awaited<ReturnType<typeof savedItemsApi.save>>;
        let resolveSave: (v: SaveResult) => void = () => {};
        vi.mocked(savedItemsApi.save).mockImplementation(
            () =>
                new Promise<SaveResult>((resolve) => {
                    resolveSave = resolve;
                }),
        );

        const { result } = renderHook(() => useSavedPostItem("post-1"));

        await waitFor(() => expect(result.current.savedId).toBeNull());

        act(() => {
            result.current.toggleSave();
        });
        await waitFor(() => expect(result.current.saveBusy).toBe(true));

        act(() => {
            result.current.toggleSave();
        });

        expect(savedItemsApi.save).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveSave(savedRow("r1", "post-1"));
        });
        await waitFor(() => expect(result.current.saveBusy).toBe(false));
    });
});
