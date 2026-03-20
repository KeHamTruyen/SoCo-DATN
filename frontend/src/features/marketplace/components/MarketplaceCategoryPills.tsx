import { cn } from "../../../shared/lib/cn";

const OPTIONS: { value: string; label: string }[] = [
    { value: "", label: "All" },
    { value: "fashion", label: "Fashion" },
    { value: "electronics", label: "Electronics" },
    { value: "home", label: "Home Decor" },
];

interface MarketplaceCategoryPillsProps {
    value: string | undefined;
    onChange: (category: string | undefined) => void;
}

export function MarketplaceCategoryPills({ value, onChange }: MarketplaceCategoryPillsProps) {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            {OPTIONS.map((opt) => {
                const active = (opt.value || undefined) === (value || undefined);
                return (
                    <button
                        key={opt.label}
                        type="button"
                        onClick={() => onChange(opt.value || undefined)}
                        className={cn(
                            "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                            active
                                ? "bg-primary text-white"
                                : "border border-neutral-200 bg-white text-neutral-600 hover:border-primary/50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
