import { CreditCard, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../shared/lib/cn";
import { formatCurrencyVnd } from "../../../shared/lib/formatCurrencyVnd";
import type { ProductQueryParams } from "../types/marketplace.types";

/** Slider at this value means no max price filter (omit from API). */
export const MARKETPLACE_PRICE_CAP = 100_000_000;

interface MarketplaceSidebarProps {
    minPriceValue: number;
    maxPriceValue: number;
    ratingFilter?: ProductQueryParams["ratingFilter"];
    onApplyPrice: (minValue: number, maxValue: number) => void;
    onRatingFilterChange: (rating: ProductQueryParams["ratingFilter"] | undefined) => void;
    tags: string[];
    activeTag?: string;
    onTagClick: (tag: string) => void;
    className?: string;
}

const RATING_OPTIONS: Array<{
    value: ProductQueryParams["ratingFilter"] | undefined;
    labelKey: string;
}> = [
    { value: "1_plus", labelKey: "marketplace.ratingOptions.1_plus" },
    { value: "2_plus", labelKey: "marketplace.ratingOptions.2_plus" },
    { value: "3_plus", labelKey: "marketplace.ratingOptions.3_plus" },
    { value: "4_plus", labelKey: "marketplace.ratingOptions.4_plus" },
    { value: "5_only", labelKey: "marketplace.ratingOptions.5_only" },
];

function clampPrice(value: number, maxValue: number) {
    return Math.min(Math.max(0, value), maxValue);
}

export function MarketplaceSidebar({
    minPriceValue,
    maxPriceValue,
    ratingFilter,
    onApplyPrice,
    onRatingFilterChange,
    tags,
    activeTag,
    onTagClick,
    className,
}: MarketplaceSidebarProps) {
    const { t } = useTranslation();
    const [draftMinPrice, setDraftMinPrice] = useState(minPriceValue);
    const [draftMaxPrice, setDraftMaxPrice] = useState(maxPriceValue);

    useEffect(() => {
        setDraftMinPrice(minPriceValue);
    }, [minPriceValue]);

    useEffect(() => {
        setDraftMaxPrice(maxPriceValue);
    }, [maxPriceValue]);

    const maxForInput = clampPrice(draftMaxPrice, MARKETPLACE_PRICE_CAP);
    const minForInput = clampPrice(draftMinPrice, maxForInput);

    return (
        <aside className={cn("w-full shrink-0 space-y-8 lg:w-64", className)}>
            <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                    <CreditCard className="h-5 w-5 text-primary" aria-hidden />
                    {t("marketplace.priceRange")}
                </h4>
                <div className="px-2">
                    <div className="mb-3 grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <span>{t("marketplace.minPrice")}</span>
                            <input
                                type="number"
                                min={0}
                                max={MARKETPLACE_PRICE_CAP}
                                value={minForInput}
                                onChange={(e) => setDraftMinPrice(Number(e.target.value))}
                                className="rounded-md border border-neutral-300 px-2 py-1 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <span>{t("marketplace.maxPrice")}</span>
                            <input
                                type="number"
                                min={0}
                                max={MARKETPLACE_PRICE_CAP}
                                value={maxForInput}
                                onChange={(e) => setDraftMaxPrice(Number(e.target.value))}
                                className="rounded-md border border-neutral-300 px-2 py-1 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                        </label>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={MARKETPLACE_PRICE_CAP}
                        step={10000}
                        value={maxForInput}
                        onChange={(e) => setDraftMaxPrice(Number(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-primary dark:bg-neutral-700"
                    />
                    <div className="mt-2 flex justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        <span>{formatCurrencyVnd(minForInput)}</span>
                        <span>
                            {maxForInput >= MARKETPLACE_PRICE_CAP
                                ? `${formatCurrencyVnd(MARKETPLACE_PRICE_CAP)}+`
                                : `${t("marketplace.upTo")} ${formatCurrencyVnd(maxForInput)}`}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onApplyPrice(minForInput, maxForInput)}
                        className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        {t("marketplace.apply")}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                    {t("marketplace.rating")}
                </h4>
                <div className="space-y-2">
                    {RATING_OPTIONS.map((option) => {
                        const checked = option.value === ratingFilter;
                        return (
                            <label
                                key={option.value ?? "rating-none"}
                                className="flex cursor-pointer items-center gap-3"
                            >
                                <input
                                    type="radio"
                                    name="marketplace-rating-filter"
                                    checked={checked}
                                    onChange={() =>
                                        onRatingFilterChange(checked ? undefined : option.value)
                                    }
                                    className="h-4 w-4 border-neutral-300 text-primary focus:ring-primary"
                                />
                                <span className="flex items-center gap-1 text-sm text-neutral-700 dark:text-neutral-300">
                                    {t(option.labelKey)}
                                    <Star
                                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                                        aria-hidden
                                    />
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <h4 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                    <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
                    {t("marketplace.personalizedTags")}
                </h4>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                        const isActive =
                            (activeTag ?? "").trim().toLowerCase() === tag.trim().toLowerCase();
                        return (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => onTagClick(tag)}
                            className={cn(
                                "cursor-pointer rounded-lg border px-3 py-1 text-xs font-bold transition-colors",
                                isActive
                                    ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                                    : "border-transparent bg-neutral-100 text-neutral-600 hover:border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700",
                            )}
                        >
                            #{tag}
                        </button>
                        );
                    })}
                    {tags.length === 0 ? (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {t("marketplace.noTags")}
                        </span>
                    ) : null}
                </div>
            </div>
        </aside>
    );
}
