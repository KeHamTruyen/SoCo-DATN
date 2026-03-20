import { LayoutGrid } from "lucide-react";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { marketplaceApi } from "../features/marketplace/api/marketplaceApi";
import { MarketplaceCategoryPills } from "../features/marketplace/components/MarketplaceCategoryPills";
import { MarketplaceHero } from "../features/marketplace/components/MarketplaceHero";
import {
    MARKETPLACE_PRICE_CAP,
    MarketplaceSidebar,
} from "../features/marketplace/components/MarketplaceSidebar";
import { MarketplaceSortMenu } from "../features/marketplace/components/MarketplaceSortMenu";
import { SearchResults } from "../features/marketplace/components/SearchResults";
import type { ProductQueryParams } from "../features/marketplace/types/marketplace.types";
import { UnifiedHeader } from "../shared/ui";

const PAGE_SIZE = 12;

function parseSort(raw: string | null): NonNullable<ProductQueryParams["sort"]> {
    if (
        raw === "newest" ||
        raw === "price_asc" ||
        raw === "price_desc" ||
        raw === "popular"
    ) {
        return raw;
    }
    return "newest";
}

export default function Marketplace() {
    const [searchParams, setSearchParams] = useSearchParams();
    const qFromUrl = searchParams.get("q") ?? "";

    const filterParams = useMemo((): Omit<ProductQueryParams, "page"> => {
        const maxRaw = searchParams.get("maxPrice");
        const maxVal = maxRaw ? Number(maxRaw) : undefined;
        const useMax =
            maxVal != null &&
            Number.isFinite(maxVal) &&
            maxVal > 0 &&
            maxVal < MARKETPLACE_PRICE_CAP;

        return {
            q: searchParams.get("q") || undefined,
            category: searchParams.get("category") || undefined,
            sort: parseSort(searchParams.get("sort")),
            maxPrice: useMax ? maxVal : undefined,
            pageSize: PAGE_SIZE,
        };
    }, [searchParams]);

    const filterSignature = useMemo(() => JSON.stringify(filterParams), [filterParams]);

    const [items, setItems] = useState<
        Awaited<ReturnType<typeof marketplaceApi.listProducts>>["items"]
    >([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [listPage, setListPage] = useState(1);
    const filterSigRef = useRef(filterSignature);

    const [draftQ, setDraftQ] = useState(qFromUrl);
    const qTimerRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        setDraftQ(qFromUrl);
    }, [qFromUrl]);

    useEffect(() => {
        return () => window.clearTimeout(qTimerRef.current);
    }, []);

    const patchSearchParams = useCallback(
        (patch: Record<string, string | undefined>) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete("page");
                for (const [key, val] of Object.entries(patch)) {
                    if (val === undefined || val === "") next.delete(key);
                    else next.set(key, val);
                }
                return next;
            });
        },
        [setSearchParams],
    );

    const handleSearchInput = useCallback(
        (value: string) => {
            setDraftQ(value);
            window.clearTimeout(qTimerRef.current);
            qTimerRef.current = window.setTimeout(() => {
                patchSearchParams({ q: value || undefined });
            }, 300);
        },
        [patchSearchParams],
    );

    const handleExplore = useCallback(() => {
        document.getElementById("marketplace-products")?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const maxSliderValue =
        filterParams.maxPrice != null ? filterParams.maxPrice : MARKETPLACE_PRICE_CAP;

    const handleMaxPriceChange = useCallback(
        (value: number) => {
            const clamped = Math.max(0, value);
            if (clamped <= 0 || clamped >= MARKETPLACE_PRICE_CAP) {
                patchSearchParams({ maxPrice: undefined });
            } else {
                patchSearchParams({ maxPrice: String(clamped) });
            }
        },
        [patchSearchParams],
    );

    useEffect(() => {
        let cancelled = false;
        const filterChanged = filterSigRef.current !== filterSignature;
        filterSigRef.current = filterSignature;

        if (filterChanged && listPage !== 1) {
            setListPage(1);
            setItems([]);
            return;
        }

        const pageToFetch = filterChanged ? 1 : listPage;

        void (async () => {
            try {
                if (pageToFetch === 1) {
                    setIsLoading(true);
                    setError(null);
                } else setIsLoadingMore(true);

                const data = await marketplaceApi.listProducts({
                    ...filterParams,
                    page: pageToFetch,
                });
                if (cancelled) return;
                setTotal(data.total);
                setItems((prev) =>
                    pageToFetch === 1 ? data.items : [...prev, ...data.items],
                );
            } catch {
                if (!cancelled) {
                    setError("Unable to load marketplace products.");
                    if (pageToFetch === 1) setItems([]);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    setIsLoadingMore(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [filterSignature, listPage, filterParams]);

    const hasMore = !isLoading && items.length > 0 && items.length < total;

    const handleLoadMore = useCallback(() => {
        if (!hasMore || isLoadingMore) return;
        setListPage((p) => p + 1);
    }, [hasMore, isLoadingMore]);

    return (
        <div className="min-h-screen bg-background-light text-neutral-900 dark:bg-background-dark dark:text-neutral-100">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/marketplace"
                searchValue={draftQ}
                onSearch={handleSearchInput}
            />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-12 flex flex-col items-center space-y-6">
                    <MarketplaceHero
                        value={draftQ}
                        onChange={handleSearchInput}
                        onExplore={handleExplore}
                    />
                    <MarketplaceCategoryPills
                        value={filterParams.category}
                        onChange={(c) => patchSearchParams({ category: c })}
                    />
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <MarketplaceSidebar
                        maxPriceValue={maxSliderValue}
                        onMaxPriceChange={handleMaxPriceChange}
                        onTrendingTag={(tag) => {
                            setDraftQ(tag);
                            patchSearchParams({ q: tag });
                        }}
                    />

                    <div className="min-w-0 flex-1 space-y-6">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <h2
                                id="marketplace-products"
                                className="flex items-center gap-2 text-xl font-bold scroll-mt-24"
                            >
                                <LayoutGrid className="h-6 w-6 text-primary" aria-hidden />
                                All products
                            </h2>
                            <MarketplaceSortMenu
                                value={filterParams.sort ?? "newest"}
                                onChange={(sort) => patchSearchParams({ sort })}
                            />
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-300">
                            {total} products found
                        </p>
                        <SearchResults
                            items={items}
                            isLoading={isLoading}
                            error={error}
                            isLoadingMore={isLoadingMore}
                            hasMore={hasMore}
                            onLoadMore={handleLoadMore}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
