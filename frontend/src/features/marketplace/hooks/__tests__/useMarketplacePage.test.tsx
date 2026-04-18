import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useMarketplacePage } from "../useMarketplacePage";
import { marketplaceApi } from "../../api/marketplaceApi";

vi.mock("../../api/marketplaceApi", () => ({
    marketplaceApi: {
        listProducts: vi.fn(),
        listCategories: vi.fn(),
        getRecommendations: vi.fn(),
        trackSearchEvent: vi.fn(),
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

function createWrapper(
    initialPath = "/marketplace?q=shoes&sort=price_desc&minPrice=10",
) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter initialEntries={[initialPath]}>
                <Routes>
                    <Route path="/marketplace" element={<>{children}</>} />
                </Routes>
            </MemoryRouter>
        );
    };
}

describe("useMarketplacePage", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.useRealTimers();
        vi.mocked(marketplaceApi.listCategories).mockResolvedValue([]);
        vi.mocked(marketplaceApi.getRecommendations).mockResolvedValue({
            products: [],
            categories: [],
            tags: [],
        });
    });

    it("parses filter params from URL and calls listProducts", async () => {
        vi.mocked(marketplaceApi.listProducts).mockResolvedValue({
            items: [],
            total: 0,
            page: 1,
            pageSize: 12,
        });

        const { result } = renderHook(() => useMarketplacePage(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(marketplaceApi.listProducts).toHaveBeenCalledWith(
            expect.objectContaining({
                q: "shoes",
                sort: "price_desc",
                minPrice: 10,
                page: 1,
            }),
        );
        expect(result.current.filterParams.q).toBe("shoes");
    });

    it("uses recommendation feed when relevance and no filters", async () => {
        vi.mocked(marketplaceApi.getRecommendations).mockResolvedValue({
            products: [{ id: "p1", name: "P1", price: 100 }],
            categories: [],
            tags: ["tag1"],
        } as never);
        vi.mocked(marketplaceApi.listProducts).mockResolvedValue({
            items: [],
            total: 0,
            page: 1,
            pageSize: 12,
        });

        const { result } = renderHook(() => useMarketplacePage(), {
            wrapper: createWrapper("/marketplace"),
        });

        await waitFor(() =>
            expect(result.current.useRecommendationFeed).toBe(true),
        );
        expect(marketplaceApi.getRecommendations).toHaveBeenCalledWith(24);
        expect(result.current.items).toHaveLength(1);
    });

    it("updates URL and tracks term after search debounce", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.mocked(marketplaceApi.listProducts).mockResolvedValue({
            items: [],
            total: 0,
            page: 1,
            pageSize: 12,
        });
        vi.mocked(marketplaceApi.trackSearchEvent).mockResolvedValue(
            undefined as never,
        );

        const { result } = renderHook(() => useMarketplacePage(), {
            wrapper: createWrapper("/marketplace"),
        });

        act(() => {
            result.current.handleSearchInput("new query");
            vi.advanceTimersByTime(320);
        });

        await waitFor(() =>
            expect(marketplaceApi.trackSearchEvent).toHaveBeenCalledWith(
                "new query",
            ),
        );
    });

    it("applies sanitized price filter to query params", async () => {
        vi.mocked(marketplaceApi.listProducts).mockResolvedValue({
            items: [],
            total: 0,
            page: 1,
            pageSize: 12,
        });

        const { result } = renderHook(() => useMarketplacePage(), {
            wrapper: createWrapper("/marketplace?q=bag&sort=popular"),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        act(() => {
            result.current.handleApplyPrice(-10, 120);
        });
        await waitFor(() =>
            expect(marketplaceApi.listProducts).toHaveBeenCalledWith(
                expect.objectContaining({
                    minPrice: undefined,
                    maxPrice: 120,
                }),
            ),
        );
    });

    it("sets error message when product loading fails", async () => {
        vi.mocked(marketplaceApi.listProducts).mockRejectedValue(new Error("boom"));

        const { result } = renderHook(() => useMarketplacePage(), {
            wrapper: createWrapper("/marketplace?q=bag&sort=popular"),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.error).toBe("marketplace.loadProductsError");
    });
});
