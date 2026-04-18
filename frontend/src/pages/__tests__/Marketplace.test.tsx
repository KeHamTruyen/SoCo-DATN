import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MarketplacePage from "../Marketplace";
import { marketplaceApi } from "../../features/marketplace/api/marketplaceApi";

vi.mock("../../features/marketplace/api/marketplaceApi", () => ({
    marketplaceApi: {
        listProducts: vi.fn(),
        listCategories: vi.fn(),
        getRecommendations: vi.fn(),
        trackSearchEvent: vi.fn(),
    },
}));

vi.mock("react-i18next", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-i18next")>();
    return {
        ...actual,
        useTranslation: () => ({
            t: (key: string) => key,
        }),
    };
});

vi.mock("../../features/marketplace/components/SearchResults", () => ({
    SearchResults: (props: {
        items: Array<{ id: string }>;
        hasMore?: boolean;
        onLoadMore?: () => void;
    }) => (
        <div>
            <span data-testid="result-count">{props.items.length}</span>
            {props.hasMore && props.onLoadMore ? (
                <button type="button" onClick={props.onLoadMore}>
                    Load more
                </button>
            ) : null}
        </div>
    ),
}));

vi.mock("../../shared/ui", () => ({
    UnifiedHeader: () => <div data-testid="header">Header</div>,
}));

function renderPage(path = "/marketplace?q=bag&sort=popular") {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/marketplace" element={<MarketplacePage />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe("Marketplace page", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(marketplaceApi.listCategories).mockResolvedValue([]);
        vi.mocked(marketplaceApi.getRecommendations).mockResolvedValue({
            products: [],
            categories: [],
            tags: [],
        });
    });

    it("does not display the products found summary text", async () => {
        vi.mocked(marketplaceApi.listProducts).mockResolvedValue({
            items: [{ id: "p1", name: "Bag", price: 120 }],
            total: 1,
            page: 1,
            pageSize: 12,
        } as never);

        renderPage();
        await waitFor(() =>
            expect(marketplaceApi.listProducts).toHaveBeenCalledTimes(1),
        );

        expect(screen.queryByText(/products found/i)).toBeNull();
    });

    it("wires load more action to marketplace list fetching", async () => {
        vi.mocked(marketplaceApi.listProducts)
            .mockResolvedValueOnce({
                items: [{ id: "p1", name: "Bag", price: 120 }],
                total: 3,
                page: 1,
                pageSize: 12,
            } as never)
            .mockResolvedValueOnce({
                items: [{ id: "p2", name: "Hat", price: 90 }],
                total: 3,
                page: 2,
                pageSize: 12,
            } as never);

        renderPage();
        await waitFor(() =>
            expect(marketplaceApi.listProducts).toHaveBeenCalled(),
        );
        const initialCalls = vi.mocked(marketplaceApi.listProducts).mock.calls.length;

        fireEvent.click(screen.getByRole("button", { name: "Load more" }));

        await waitFor(() =>
            expect(vi.mocked(marketplaceApi.listProducts).mock.calls.length).toBeGreaterThan(
                initialCalls,
            ),
        );
    });
});
