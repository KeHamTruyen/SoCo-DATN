import type { ProductListItem } from "../types/marketplace.types";
import { ProductCard } from "./ProductCard";
import { Button } from "../../../shared/ui";

interface SearchResultsProps {
    items: ProductListItem[];
    isLoading: boolean;
    error: string | null;
    isLoadingMore?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

export function SearchResults({
    items,
    isLoading,
    error,
    isLoadingMore = false,
    hasMore = false,
    onLoadMore,
}: SearchResultsProps) {
    if (isLoading) {
        return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                Loading products...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                {error}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                No products found.
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {items.map((item) => (
                    <ProductCard key={item.id} product={item} />
                ))}
            </div>
            {hasMore && onLoadMore ? (
                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-2 border-neutral-200 px-8 py-3 font-bold text-neutral-600 hover:border-primary hover:text-primary dark:border-neutral-800 dark:text-neutral-400"
                        disabled={isLoadingMore}
                        onClick={onLoadMore}
                    >
                        {isLoadingMore ? "Loading..." : "Load more products"}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
