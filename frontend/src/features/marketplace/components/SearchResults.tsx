import type { ProductListItem } from "../types/marketplace.types";
import { ProductCard } from "./ProductCard";

interface SearchResultsProps {
    items: ProductListItem[];
    isLoading: boolean;
    error: string | null;
}

export function SearchResults({ items, isLoading, error }: SearchResultsProps) {
    if (isLoading) {
        return (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                Loading products...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                {error}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                No products found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
                <ProductCard key={item.id} product={item} />
            ))}
        </div>
    );
}
