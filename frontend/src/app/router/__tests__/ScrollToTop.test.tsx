import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ScrollToTop from "../ScrollToTop";

function RouterHarness() {
    return (
        <>
            <ScrollToTop />
            <Link to="/products/p1">View product</Link>
            <Link to="/products/p1#reviews">View reviews</Link>
            <Routes>
                <Route path="/feed" element={<div>Feed page</div>} />
                <Route path="/products/:id" element={<div>Product page</div>} />
            </Routes>
        </>
    );
}

describe("ScrollToTop", () => {
    beforeEach(() => {
        Object.defineProperty(window, "scrollTo", {
            value: vi.fn(),
            writable: true,
        });
    });

    it("scrolls to the top when navigating to a new route", async () => {
        render(
            <MemoryRouter initialEntries={["/feed"]}>
                <RouterHarness />
            </MemoryRouter>,
        );

        await waitFor(() => expect(window.scrollTo).toHaveBeenCalledTimes(1));
        vi.mocked(window.scrollTo).mockClear();

        fireEvent.click(screen.getByText("View product"));

        await waitFor(() => {
            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 0,
                left: 0,
                behavior: "auto",
            });
        });
    });

    it("keeps hash navigation available for section anchors", async () => {
        render(
            <MemoryRouter initialEntries={["/feed"]}>
                <RouterHarness />
            </MemoryRouter>,
        );

        await waitFor(() => expect(window.scrollTo).toHaveBeenCalledTimes(1));
        vi.mocked(window.scrollTo).mockClear();

        fireEvent.click(screen.getByText("View reviews"));
        await screen.findByText("Product page");

        expect(window.scrollTo).not.toHaveBeenCalled();
    });
});
