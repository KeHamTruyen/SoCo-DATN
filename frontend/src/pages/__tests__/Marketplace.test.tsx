import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MarketplacePage from "../Marketplace";
import { marketplaceApi } from "../../features/marketplace/api/marketplaceApi";

const marketplaceApiMocks = vi.hoisted(() => ({
    listProducts: vi.fn(),
    listCategories: vi.fn(),
    getRecommendations: vi.fn(),
    trackSearchEvent: vi.fn(),
}));

vi.mock("../../features/marketplace/api/marketplaceApi", () => ({
    marketplaceApi: marketplaceApiMocks,
}));

vi.mock("../../shared/auth/useAuthSession", () => ({
    useAuthSession: () => ({
        isAuthenticated: false,
        user: null,
    }),
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

vi.mock("../../app/layouts/AppHeaderContext", () => ({
    useConfigureAppHeader: vi.fn(),
}));

function renderPage(path = "/marketplace?q=bag&sort=popular") {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/marketplace" element={<MarketplacePage />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe("Marketplace page", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        class MockIntersectionObserver {
            constructor(private readonly callback: IntersectionObserverCallback) {}
            observe() {
                this.callback(
                    [{ isIntersecting: true } as IntersectionObserverEntry],
                    this as unknown as IntersectionObserver,
                );
            }
            unobserve() {}
            disconnect() {}
            takeRecords() {
                return [];
            }
            readonly root = null;
            readonly rootMargin = "";
            readonly thresholds = [];
        }
        vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
        vi.mocked(marketplaceApi.listCategories).mockResolvedValue([]);
        vi.mocked(marketplaceApi.getRecommendations).mockResolvedValue({
            products: [],
            categories: [],
            tags: [],
            total: 0,
            page: 1,
            pageSize: 12,
            hasMore: false,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
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
            expect(marketplaceApi.listProducts).toHaveBeenCalled(),
        );

        expect(screen.queryByText(/products found/i)).toBeNull();
    });

    it("wires load more action to marketplace list fetching", async () => {
        vi.mocked(marketplaceApi.listProducts)
            .mockResolvedValueOnce({
                items: [{ id: "p1", name: "Bag", price: 120 }],
                total: 24,
                page: 1,
                pageSize: 12,
            } as never)
            .mockResolvedValueOnce({
                items: [{ id: "p2", name: "Hat", price: 90 }],
                total: 24,
                page: 2,
                pageSize: 12,
            } as never);

        renderPage();
        await waitFor(() =>
            expect(marketplaceApi.listProducts).toHaveBeenCalled(),
        );
        await waitFor(() =>
            expect(vi.mocked(marketplaceApi.listProducts).mock.calls.length).toBeGreaterThan(1),
        );
    });
});
