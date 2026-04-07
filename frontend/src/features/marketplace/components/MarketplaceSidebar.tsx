import { CreditCard, Star, TrendingUp } from "lucide-react";
import { cn } from "../../../shared/lib/cn";
import { formatCurrencyVnd } from "../../../shared/lib/formatCurrencyVnd";

/** Slider at this value means no max price filter (omit from API). */
export const MARKETPLACE_PRICE_CAP = 1000;

interface MarketplaceSidebarProps {
    maxPriceValue: number;
    onMaxPriceChange: (value: number) => void;
    onTrendingTag: (tag: string) => void;
    className?: string;
}

const TRENDING = ["SummerVibes", "TechGadgets", "Minimalist", "EcoFriendly"];

export function MarketplaceSidebar({
    maxPriceValue,
    onMaxPriceChange,
    onTrendingTag,
    className,
}: MarketplaceSidebarProps) {
    return (
        <aside className={cn("w-full shrink-0 space-y-8 lg:w-64", className)}>
            <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                    <CreditCard className="h-5 w-5 text-primary" aria-hidden />
                    Price range
                </h4>
                <div className="px-2">
                    <input
                        type="range"
                        min={0}
                        max={MARKETPLACE_PRICE_CAP}
                        step={10}
                        value={maxPriceValue}
                        onChange={(e) => onMaxPriceChange(Number(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-primary dark:bg-neutral-700"
                    />
                    <div className="mt-2 flex justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        <span>{formatCurrencyVnd(0)}</span>
                        <span>
                            {maxPriceValue >= MARKETPLACE_PRICE_CAP
                                ? `${formatCurrencyVnd(MARKETPLACE_PRICE_CAP)}+`
                                : `Up to ${formatCurrencyVnd(maxPriceValue)}`}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-neutral-900 dark:text-white">Rating</h4>
                <label className="group flex cursor-not-allowed items-center gap-3 opacity-60">
                    <input
                        type="checkbox"
                        disabled
                        className="h-5 w-5 rounded border-neutral-300 bg-transparent dark:border-neutral-600"
                    />
                    <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                        4.0+
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                        <span className="text-xs text-neutral-400">(soon)</span>
                    </span>
                </label>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-neutral-900 dark:text-white">Status</h4>
                <label className="group flex cursor-not-allowed items-center gap-3 opacity-60">
                    <input type="checkbox" checked disabled readOnly className="h-5 w-5 rounded" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">In stock</span>
                </label>
            </div>

            <div className="space-y-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <h4 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                    <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
                    Trending
                </h4>
                <div className="flex flex-wrap gap-2">
                    {TRENDING.map((tag, i) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => onTrendingTag(tag)}
                            className={cn(
                                "cursor-pointer rounded-lg border px-3 py-1 text-xs font-bold transition-colors",
                                i === 0
                                    ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                                    : "border-transparent bg-neutral-100 text-neutral-600 hover:border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700",
                            )}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
