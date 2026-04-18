import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SearchPage from "../Search";
import { searchApi } from "../../features/search/api/searchApi";
import { marketplaceApi } from "../../features/marketplace/api/marketplaceApi";

vi.mock("../../features/search/api/searchApi", () => ({
    searchApi: {
        search: vi.fn(),
    },
}));

vi.mock("../../features/marketplace/api/marketplaceApi", () => ({
    marketplaceApi: {
        listProducts: vi.fn(),
    },
}));

vi.mock("../../features/feed/api/feedApi", () => ({
    feedApi: {
        likePost: vi.fn(),
        addComment: vi.fn(),
        deletePost: vi.fn(),
    },
}));

vi.mock("../../shared/auth/useAuthSession", () => ({
    useAuthSession: () => ({
        user: {
            id: "u1",
            email: "u1@example.com",
            fullName: "User One",
        },
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

vi.mock("../../features/feed/components/FeedPostCard", () => ({
    FeedPostCard: () => <div data-testid="feed-post-card">PostCard</div>,
}));

vi.mock("../../features/marketplace/components/SearchResults", () => ({
    SearchResults: (props: { items: Array<{ id: string }> }) => (
        <div data-testid="search-results">results:{props.items.length}</div>
    ),
}));

vi.mock("../../shared/ui", () => ({
    UnifiedHeader: (props: { onSearchSubmit?: (v: string) => void }) => (
        <button type="button" onClick={() => props.onSearchSubmit?.("phone")}>
            Header
        </button>
    ),
    Avatar: () => <div data-testid="avatar">Avatar</div>,
}));

function renderPage(path = "/search?q=phone") {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/search" element={<SearchPage />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe("Search page", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("renders all tab and uses SearchResults for top products", async () => {
        vi.mocked(searchApi.search).mockResolvedValue({
            products: { total: 1, items: [{ id: "p1", title: "Phone" }] },
            users: { total: 0, items: [] },
            posts: { total: 0, items: [] },
        } as never);

        renderPage();

        await waitFor(() =>
            expect(searchApi.search).toHaveBeenCalledWith("phone", { limit: 5 }),
        );
        expect(screen.getByTestId("search-results")).toBeTruthy();
    });

    it("switches tab and fetches product-only results", async () => {
        vi.mocked(searchApi.search).mockResolvedValue({
            products: { total: 0, items: [] },
            users: { total: 0, items: [] },
            posts: { total: 0, items: [] },
        } as never);
        vi.mocked(marketplaceApi.listProducts).mockResolvedValue({
            items: [{ id: "p1", name: "Phone", price: 100 }],
            total: 1,
            page: 1,
            pageSize: 10,
        } as never);

        renderPage();
        fireEvent.click(screen.getByRole("button", { name: "Products" }));

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

    it("switches to people tab and renders user section", async () => {
        vi.mocked(searchApi.search)
            .mockResolvedValueOnce({
                products: { total: 0, items: [] },
                users: { total: 0, items: [] },
                posts: { total: 0, items: [] },
            } as never)
            .mockResolvedValue({
                products: { total: 0, items: [] },
                users: { total: 1, items: [{ id: "u2", username: "anna" }] },
                posts: { total: 0, items: [] },
            } as never);

        renderPage();
        fireEvent.click(screen.getByRole("button", { name: "People" }));

        await waitFor(() =>
            expect(searchApi.search).toHaveBeenLastCalledWith(
                "phone",
                expect.objectContaining({ types: ["users"] }),
            ),
        );
        expect(screen.getByText("@anna")).toBeTruthy();
    });
});
