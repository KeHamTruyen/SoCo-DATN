import { Compass, Search } from "lucide-react";
import { Button } from "../../../shared/ui";

interface MarketplaceHeroProps {
    value: string;
    onChange: (value: string) => void;
    onExplore: () => void;
}

export function MarketplaceHero({ value, onChange, onExplore }: MarketplaceHeroProps) {
    return (
        <div className="mb-10 flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2">
            <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search products, categories, or hashtags..."
                    className="block w-full rounded-2xl border border-neutral-200 bg-white py-4 pl-12 pr-4 text-base text-neutral-900 shadow-sm outline-none transition-all placeholder:text-neutral-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />
            </div>
            <Button
                type="button"
                className="h-auto shrink-0 gap-2 rounded-2xl px-8 py-4 shadow-lg shadow-primary/20"
                onClick={onExplore}
            >
                <Compass className="h-5 w-5" />
                Explore
            </Button>
        </div>
    );
}
