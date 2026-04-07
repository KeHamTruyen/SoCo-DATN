import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCartPage } from "../useCartPage";
import { cartApi } from "../../api/cartApi";

vi.mock("../../api/cartApi", () => ({
    cartApi: {
        getCart: vi.fn(),
        updateItem: vi.fn(),
        removeItem: vi.fn(),
    },
}));

const mockCart = {
    groups: [
        {
            sellerId: "s1",
            sellerName: "Shop",
            items: [
                { id: "c1", price: 10, quantity: 2 },
                { id: "c2", price: 5, quantity: 1 },
            ],
        },
    ],
};

describe("useCartPage", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("loads cart and initializes selection", async () => {
        vi.mocked(cartApi.getCart).mockResolvedValueOnce(mockCart as never);

        const { result } = renderHook(() => useCartPage());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.cart).toBeTruthy();
        expect(result.current.selectedCount).toBe(2);
        expect(result.current.selectedSubtotal).toBe(25);
    });

    it("toggles select all", async () => {
        vi.mocked(cartApi.getCart).mockResolvedValueOnce(mockCart as never);
        const { result } = renderHook(() => useCartPage());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        act(() => result.current.handleSelectAll(false));
        expect(result.current.selectedCount).toBe(0);

        act(() => result.current.handleSelectAll(true));
        expect(result.current.selectedCount).toBe(2);
    });

    it("updates quantity", async () => {
        vi.mocked(cartApi.getCart).mockResolvedValueOnce(mockCart as never);
        vi.mocked(cartApi.updateItem).mockResolvedValueOnce(mockCart as never);
        const { result } = renderHook(() => useCartPage());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.handleQuantityChange("c1", 3);
        });

        expect(cartApi.updateItem).toHaveBeenCalledWith("c1", 3);
        expect(result.current.actionError).toBeNull();
    });

    it("handles remove error", async () => {
        vi.mocked(cartApi.getCart).mockResolvedValueOnce(mockCart as never);
        vi.mocked(cartApi.removeItem).mockRejectedValueOnce(new Error("boom"));
        const { result } = renderHook(() => useCartPage());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.handleRemove("c1");
        });

        expect(result.current.actionError).toContain("Unable to remove item");
    });
});
