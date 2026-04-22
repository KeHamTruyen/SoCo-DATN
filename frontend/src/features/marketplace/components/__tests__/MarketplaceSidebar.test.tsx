import { fireEvent, render, screen } from "@testing-library/react";
import { MarketplaceSidebar } from "../MarketplaceSidebar";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) =>
            ({
                "marketplace.priceRange": "Price range",
                "marketplace.minPrice": "Min",
                "marketplace.maxPrice": "Max",
                "marketplace.upTo": "Up to",
                "marketplace.apply": "Apply",
                "marketplace.rating": "Rating",
                "marketplace.personalizedTags": "Personalized tags",
                "marketplace.noTags": "No tags",
                "marketplace.ratingOptions.1_plus": "1 star and up",
                "marketplace.ratingOptions.2_plus": "2 stars and up",
                "marketplace.ratingOptions.3_plus": "3 stars and up",
                "marketplace.ratingOptions.4_plus": "4 stars and up",
                "marketplace.ratingOptions.5_only": "5 stars only",
            })[key] ?? key,
    }),
}));

describe("MarketplaceSidebar", () => {
    it("applies sanitized price values on apply click", () => {
        const onApplyPrice = vi.fn();
        render(
            <MarketplaceSidebar
                minPriceValue={10}
                maxPriceValue={100}
                ratingFilter={undefined}
                onApplyPrice={onApplyPrice}
                onRatingFilterChange={vi.fn()}
                tags={["foo"]}
                activeTag="foo"
                onTagClick={vi.fn()}
            />,
        );

        const inputs = screen.getAllByRole("spinbutton");
        fireEvent.change(inputs[0], { target: { value: "-20" } });
        fireEvent.change(inputs[1], { target: { value: "50" } });
        fireEvent.click(screen.getByRole("button", { name: "Apply" }));

        expect(onApplyPrice).toHaveBeenCalledWith(0, 50);
    });

    it("calls rating change callback and does not render status filter", () => {
        const onRatingFilterChange = vi.fn();
        render(
            <MarketplaceSidebar
                minPriceValue={0}
                maxPriceValue={100}
                ratingFilter={undefined}
                onApplyPrice={vi.fn()}
                onRatingFilterChange={onRatingFilterChange}
                tags={[]}
                onTagClick={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole("radio", { name: /2 stars and up/i }));

        expect(onRatingFilterChange).toHaveBeenCalledWith("2_plus");
        expect(screen.queryByText("marketplace.status")).toBeNull();
    });
});

