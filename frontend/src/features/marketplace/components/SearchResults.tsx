import type { ProductListItem } from "../types/marketplace.types";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { ProductCard } from "./ProductCard";

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
    const { t } = useTranslation();
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!hasMore || !onLoadMore || isLoadingMore) return;
        const node = sentinelRef.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry?.isIntersecting) {
                    onLoadMore();
                }
            },
            { rootMargin: "240px 0px" },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, onLoadMore]);

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                {t("marketplace.loadingProducts")}
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
                {t("marketplace.noProductsFound")}
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
                    <div
                        ref={sentinelRef}
                        aria-hidden
                        className="h-1 w-full"
                    />
                    {isLoadingMore ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {t("marketplace.loading")}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
