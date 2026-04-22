import { renderHook, act } from "@testing-library/react";

// Mock the httpClient
vi.mock("../../../shared/api/httpClient", () => ({
    httpClient: {
        get: vi.fn(),
    },
}));

import { useAiStudioProducts } from "../useAiStudioProducts";

describe("useAiStudioProducts", () => {
    it("should initialize with default states", () => {
        const { result } = renderHook(() => useAiStudioProducts(true));
        expect(result.current.productQuery).toBe("");
        expect(result.current.selectedProduct).toBeNull();
        expect(result.current.productDropdownOpen).toBe(false);
    });

    it("should reset state correctly", () => {
        const { result } = renderHook(() => useAiStudioProducts(true));
        act(() => {
            result.current.setProductQuery("Test");
            result.current.setProductDropdownOpen(true);
        });
        expect(result.current.productQuery).toBe("Test");
        act(() => {
            result.current.resetProducts();
        });
        expect(result.current.productQuery).toBe("");
        expect(result.current.productDropdownOpen).toBe(false);
    });

    it("should handle selecting a product", () => {
        const { result } = renderHook(() => useAiStudioProducts(true));
        const mockProduct = { id: "1", title: "Product 1" };
        act(() => {
            result.current.handleSelectProduct(mockProduct);
        });
        expect(result.current.selectedProduct).toEqual(mockProduct);
        expect(result.current.productQuery).toBe("Product 1");
        expect(result.current.productDropdownOpen).toBe(false);
    });
});
