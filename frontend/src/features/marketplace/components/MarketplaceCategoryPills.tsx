import { cn } from "../../../shared/lib/cn";
import { useTranslation } from "react-i18next";
import type { MarketplaceCategoryOption } from "../types/marketplace.types";

interface MarketplaceCategoryPillsProps {
    value: string | undefined;
    options: MarketplaceCategoryOption[];
    onChange: (categoryId: string | undefined) => void;
}

export function MarketplaceCategoryPills({
    value,
    options,
    onChange,
}: MarketplaceCategoryPillsProps) {
    const { t } = useTranslation();
    const displayOptions = [
        { id: "", name: t("marketplace.allCategories") },
        ...options,
    ];
    return (
        <div className="flex flex-wrap justify-center gap-2">
            {displayOptions.map((opt) => {
                const active = (opt.id || undefined) === (value || undefined);
                return (
                    <button
                        key={opt.id || "all"}
                        type="button"
                        onClick={() => onChange(opt.id || undefined)}
                        className={cn(
                            "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                            active
                                ? "bg-primary text-white"
                                : "border border-neutral-200 bg-white text-neutral-600 hover:border-primary/50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
                        )}
                    >
                        {opt.name}
                    </button>
                );
            })}
        </div>
    );
}
