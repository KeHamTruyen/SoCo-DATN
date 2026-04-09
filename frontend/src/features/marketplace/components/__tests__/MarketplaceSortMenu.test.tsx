import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarketplaceSortMenu } from "../MarketplaceSortMenu";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) =>
            ({
                "marketplace.sort.relevance": "Relevant",
                "marketplace.sort.popular": "Popular",
                "marketplace.sort.newest": "Newest",
                "marketplace.sort.priceAsc": "Price Low to High",
                "marketplace.sort.priceDesc": "Price High to Low",
                "marketplace.sort.priceDropdown": "Sort by price",
            })[key] ?? key,
    }),
}));

describe("MarketplaceSortMenu", () => {
    it("changes mode sort when quick option is clicked", () => {
        const onChange = vi.fn();
        render(<MarketplaceSortMenu value="relevance" onChange={onChange} />);

        fireEvent.click(screen.getByRole("button", { name: "Popular" }));

        expect(onChange).toHaveBeenCalledWith("popular");
    });

    it("changes to price sort through dropdown", () => {
        const onChange = vi.fn();
        render(<MarketplaceSortMenu value="newest" onChange={onChange} />);

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "price_desc" },
        });

        expect(onChange).toHaveBeenCalledWith("price_desc");
    });
});

