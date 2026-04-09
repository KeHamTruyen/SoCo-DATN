import { useTranslation } from "react-i18next";
import { cn } from "../../../shared/lib/cn";
import type { ProductQueryParams } from "../types/marketplace.types";

export type MarketplaceSortValue = NonNullable<ProductQueryParams["sort"]>;
type PriceSortValue = Extract<MarketplaceSortValue, "price_asc" | "price_desc">;

const MODE_OPTIONS: Array<{
    value: MarketplaceSortValue;
    labelKey: string;
}> = [
    { value: "relevance", labelKey: "marketplace.sort.relevance" },
    { value: "popular", labelKey: "marketplace.sort.popular" },
    { value: "newest", labelKey: "marketplace.sort.newest" },
];

const PRICE_OPTIONS: Array<{
    value: PriceSortValue;
    labelKey: string;
}> = [
    { value: "price_asc", labelKey: "marketplace.sort.priceAsc" },
    { value: "price_desc", labelKey: "marketplace.sort.priceDesc" },
];

function isPriceSort(value: MarketplaceSortValue): value is PriceSortValue {
    return value === "price_asc" || value === "price_desc";
}

interface MarketplaceSortMenuProps {
    value: MarketplaceSortValue;
    onChange: (value: MarketplaceSortValue) => void;
    className?: string;
}

export function MarketplaceSortMenu({ value, onChange, className }: MarketplaceSortMenuProps) {
    const { t } = useTranslation();
    const priceValue = isPriceSort(value) ? value : "";

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            <div className="flex flex-wrap gap-2">
                {MODE_OPTIONS.map((option) => {
                    const active = value === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                                active
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/40 hover:text-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
                            )}
                        >
                            {t(option.labelKey)}
                        </button>
                    );
                })}
            </div>
            <select
                value={priceValue}
                onChange={(e) => {
                    const next = e.target.value as PriceSortValue | "";
                    if (next) onChange(next);
                }}
                className={cn(
                    "h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 outline-none transition-colors",
                    "hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/15",
                    "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200",
                )}
            >
                <option value="">{t("marketplace.sort.priceDropdown")}</option>
                {PRICE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                    </option>
                ))}
            </select>
        </div>
    );
}
