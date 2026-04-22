import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProductDetailPage } from "../useProductDetailPage";
import { productApi } from "../../api/productApi";
import { profileApi } from "../../../profile/api/profileApi";
import { cartApi } from "../../../cart/api/cartApi";
import { createElement, type ReactNode } from "react";

vi.mock("../../api/productApi", () => ({
    productApi: {
        getProductDetail: vi.fn(),
        getProductReviews: vi.fn(),
    },
}));

vi.mock("../../../profile/api/profileApi", () => ({
    profileApi: {
        getProfile: vi.fn(),
    },
}));

vi.mock("../../../cart/api/cartApi", () => ({
    cartApi: {
        addItem: vi.fn(),
    },
}));

const mockProduct = {
    id: "p1",
    name: "Product A",
    description: "desc",
    price: 100,
    images: ["a.jpg"],
    seller: { id: "s1", name: "Shop A" },
    variants: [{ id: "v1", name: "Size", value: "M", price: 100, stockQuantity: 3 }],
};

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client: queryClient }, children);
    };
}

describe("useProductDetailPage", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("loads product + reviews on mount", async () => {
        vi.mocked(productApi.getProductDetail).mockResolvedValueOnce(mockProduct as never);
        vi.mocked(productApi.getProductReviews).mockResolvedValueOnce({
            items: [],
            page: 1,
            limit: 3,
            total: 0,
        } as never);
        vi.mocked(profileApi.getProfile).mockResolvedValueOnce({
            followersCount: 12,
            shopRating: 4.8,
        } as never);

        const { result } = renderHook(() => useProductDetailPage("p1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(productApi.getProductDetail).toHaveBeenCalledWith("p1");
        expect(productApi.getProductReviews).toHaveBeenCalled();
        expect(result.current.product?.seller?.followersCount).toBe(12);
    });

    it("supports loading more reviews", async () => {
        vi.mocked(productApi.getProductDetail).mockResolvedValueOnce(mockProduct as never);
        vi.mocked(productApi.getProductReviews)
            .mockResolvedValueOnce({
                items: [{ id: "r1", rating: 5, content: "", createdAt: "", helpfulCount: 0, author: { id: "u", name: "A" }, isVerifiedBuyer: false, photos: [] }],
                page: 1,
                limit: 3,
                total: 4,
            } as never)
            .mockResolvedValueOnce({
                items: [{ id: "r2", rating: 4, content: "", createdAt: "", helpfulCount: 0, author: { id: "u2", name: "B" }, isVerifiedBuyer: false, photos: [] }],
                page: 2,
                limit: 3,
                total: 4,
            } as never);
        vi.mocked(profileApi.getProfile).mockResolvedValueOnce({} as never);

        const { result } = renderHook(() => useProductDetailPage("p1"), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.loadMoreReviews();
        });

        await waitFor(() => expect(result.current.reviews).toHaveLength(2));
        expect(result.current.canLoadMoreReviews).toBe(true);
    });

    it("returns cart error when variant is missing", async () => {
        vi.mocked(productApi.getProductDetail).mockResolvedValueOnce(mockProduct as never);
        vi.mocked(productApi.getProductReviews).mockResolvedValueOnce({
            items: [],
            page: 1,
            limit: 3,
            total: 0,
        } as never);
        vi.mocked(profileApi.getProfile).mockResolvedValueOnce({} as never);

        const { result } = renderHook(() => useProductDetailPage("p1"), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            const ok = await result.current.addToCartWithStatus(1);
            expect(ok).toBe(false);
        });

        expect(result.current.cartActionError).toContain("select a variant");
    });

    it("handles add to cart success", async () => {
        vi.mocked(productApi.getProductDetail).mockResolvedValueOnce({
            ...mockProduct,
            variants: undefined,
        } as never);
        vi.mocked(productApi.getProductReviews).mockResolvedValueOnce({
            items: [],
            page: 1,
            limit: 3,
            total: 0,
        } as never);
        vi.mocked(profileApi.getProfile).mockResolvedValueOnce({} as never);
        vi.mocked(cartApi.addItem).mockResolvedValueOnce({} as never);

        const { result } = renderHook(() => useProductDetailPage("p1"), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            const ok = await result.current.addToCartWithStatus(2);
            expect(ok).toBe(true);
        });

        expect(cartApi.addItem).toHaveBeenCalledWith("p1", 2, undefined);
        expect(result.current.cartActionError).toBeNull();
    });
});
