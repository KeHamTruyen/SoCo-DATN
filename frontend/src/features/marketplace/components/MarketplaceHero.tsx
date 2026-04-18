import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MarketplaceHeroProps {
    value: string;
    onChange: (value: string) => void;
}

export function MarketplaceHero({ value, onChange }: MarketplaceHeroProps) {
    const { t } = useTranslation();
    return (
        <div className="mb-10 w-full max-w-3xl">
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t("marketplace.searchPlaceholder")}
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />
            </div>
        </div>
    );
}
