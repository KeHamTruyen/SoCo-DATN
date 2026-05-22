import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { useProductDetailPage } from "./useProductDetailPage";
import { productApi } from "../api/productApi";
import { profileApi } from "../../profile/api/profileApi";
import { cartApi } from "../../cart/api/cartApi";
import { marketplaceApi } from "../../marketplace/api/marketplaceApi";

vi.mock("../api/productApi", () => ({
    productApi: {
        getProductDetail: vi.fn(),
        getProductReviews: vi.fn(),
    },
}));

vi.mock("../../messaging/context/MessagingContext", () => ({
    useMessagingOptional: () => null,
}));

vi.mock("../../cart/api/cartApi", () => ({
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
        return createElement(
            MemoryRouter,
            null,
            createElement(QueryClientProvider, { client: queryClient }, children),
        );
    };
}

describe("useProductDetailPage", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.spyOn(profileApi, "getProfile").mockResolvedValue({
            followersCount: 12,
            shopRating: 4.8,
            isFollowing: false,
        } as never);
        vi.spyOn(profileApi, "followUser").mockResolvedValue({ followed: true });
        vi.spyOn(profileApi, "unfollowUser").mockResolvedValue({ followed: false });
        vi.spyOn(marketplaceApi, "trackProductView").mockResolvedValue(undefined);
    });

    it("loads product + reviews on mount", async () => {
        vi.mocked(productApi.getProductDetail).mockResolvedValue(mockProduct as never);
        vi.mocked(productApi.getProductReviews).mockResolvedValue({
            items: [],
            page: 1,
            limit: 3,
            total: 0,
        } as never);
        vi.mocked(profileApi.getProfile).mockResolvedValue({
            followersCount: 12,
            shopRating: 4.8,
            isFollowing: true,
        } as never);

        const { result } = renderHook(
            () => useProductDetailPage({ productId: "p1", isAuthenticated: true }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(productApi.getProductDetail).toHaveBeenCalledWith("p1");
        expect(profileApi.getProfile).toHaveBeenCalledWith("s1");
        expect(productApi.getProductReviews).toHaveBeenCalled();
        await waitFor(() =>
            expect(result.current.product?.seller?.followersCount).toBe(12),
        );
        expect(result.current.product?.seller?.isFollowing).toBe(true);
    });

    it("supports loading more reviews", async () => {
        vi.mocked(productApi.getProductDetail).mockResolvedValue(mockProduct as never);
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
        vi.mocked(productApi.getProductDetail).mockResolvedValue(mockProduct as never);
        vi.mocked(productApi.getProductReviews).mockResolvedValue({
            items: [],
            page: 1,
            limit: 3,
            total: 0,
        } as never);

        const { result } = renderHook(
            () => useProductDetailPage({ productId: "p1", isAuthenticated: true }),
            { wrapper: createWrapper() },
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            const ok = await result.current.addToCartWithStatus(1);
            expect(ok).toBe(false);
        });

        expect(result.current.cartActionError).toContain("select a variant");
    });

    it("handles add to cart success", async () => {
        vi.mocked(productApi.getProductDetail).mockResolvedValue({
            ...mockProduct,
            variants: undefined,
        } as never);
        vi.mocked(productApi.getProductReviews).mockResolvedValue({
            items: [],
            page: 1,
            limit: 3,
            total: 0,
        } as never);
        vi.mocked(cartApi.addItem).mockResolvedValue({} as never);

        const { result } = renderHook(
            () => useProductDetailPage({ productId: "p1", isAuthenticated: true }),
            { wrapper: createWrapper() },
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            const ok = await result.current.addToCartWithStatus(2);
            expect(ok).toBe(true);
        });

        expect(cartApi.addItem).toHaveBeenCalledWith("p1", 2, undefined);
        expect(result.current.cartActionError).toBeNull();
    });

    it("calls onAuthRequired when guest toggles follow", async () => {
        vi.mocked(productApi.getProductDetail).mockResolvedValue(mockProduct as never);
        vi.mocked(productApi.getProductReviews).mockResolvedValue({
            items: [],
            page: 1,
            limit: 3,
            total: 0,
        } as never);

        const onAuthRequired = vi.fn();
        const { result } = renderHook(
            () =>
                useProductDetailPage({
                    productId: "p1",
                    isAuthenticated: false,
                    onAuthRequired,
                }),
            { wrapper: createWrapper() },
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.toggleSellerFollow();
        });

        expect(onAuthRequired).toHaveBeenCalled();
        expect(profileApi.followUser).not.toHaveBeenCalled();
    });

    it("toggles seller follow when authenticated", async () => {
        vi.mocked(productApi.getProductDetail).mockResolvedValue({
            ...mockProduct,
            seller: { id: "s1", name: "Shop A", isFollowing: false, followersCount: 5 },
        } as never);
        vi.mocked(productApi.getProductReviews).mockResolvedValue({
            items: [],
            page: 1,
            limit: 3,
            total: 0,
        } as never);
        vi.mocked(profileApi.getProfile).mockResolvedValue({
            isFollowing: false,
            followersCount: 5,
        } as never);
        vi.mocked(profileApi.followUser).mockResolvedValue({ followed: true });

        const { result } = renderHook(
            () => useProductDetailPage({ productId: "p1", isAuthenticated: true }),
            { wrapper: createWrapper() },
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.toggleSellerFollow();
        });

        await waitFor(() =>
            expect(result.current.product?.seller?.isFollowing).toBe(true),
        );
        expect(profileApi.followUser).toHaveBeenCalledWith("s1");
        expect(result.current.product?.seller?.followersCount).toBe(6);
    });
});
