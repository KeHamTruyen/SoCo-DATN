import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { marketplaceApi } from "../api/marketplaceApi";
import { MARKETPLACE_PRICE_CAP } from "../components/MarketplaceSidebar";
import type {
    MarketplaceCategoryOption,
    ProductQueryParams,
} from "../types/marketplace.types";
import { parseRatingFilter, parseSort } from "../utils/marketplaceFilters";

const PAGE_SIZE = 12;

export function useMarketplacePage() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const qFromUrl = searchParams.get("q") ?? "";

    const filterParams = useMemo((): Omit<ProductQueryParams, "page"> => {
        const minRaw = searchParams.get("minPrice");
        const minVal = minRaw ? Number(minRaw) : undefined;
        const maxRaw = searchParams.get("maxPrice");
        const maxVal = maxRaw ? Number(maxRaw) : undefined;
        const useMin = minVal != null && Number.isFinite(minVal) && minVal > 0;
        const useMax =
            maxVal != null &&
            Number.isFinite(maxVal) &&
            maxVal > 0 &&
            maxVal < MARKETPLACE_PRICE_CAP;

        return {
            q: searchParams.get("q") || undefined,
            categoryId: searchParams.get("categoryId") || undefined,
            sort: parseSort(searchParams.get("sort")),
            ratingFilter: parseRatingFilter(searchParams.get("ratingFilter")),
            minPrice: useMin ? minVal : undefined,
            maxPrice: useMax ? maxVal : undefined,
            pageSize: PAGE_SIZE,
        };
    }, [searchParams]);

    const filterSignature = useMemo(
        () => JSON.stringify(filterParams),
        [filterParams],
    );

    const [items, setItems] = useState<
        Awaited<ReturnType<typeof marketplaceApi.listProducts>>["items"]
    >([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<MarketplaceCategoryOption[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [useRecommendationFeed, setUseRecommendationFeed] = useState(false);
    const [listPage, setListPage] = useState(1);
    const filterSigRef = useRef(filterSignature);

    const [draftQ, setDraftQ] = useState(qFromUrl);
    const qTimerRef = useRef<number | null>(null);

    useEffect(() => {
        setDraftQ(qFromUrl);
    }, [qFromUrl]);

    useEffect(() => {
        return () => {
            if (qTimerRef.current !== null) {
                window.clearTimeout(qTimerRef.current);
            }
        };
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
            if (qTimerRef.current !== null) {
                window.clearTimeout(qTimerRef.current);
            }
            qTimerRef.current = window.setTimeout(() => {
                patchSearchParams({ q: value || undefined });
                if (value.trim().length >= 2) {
                    void marketplaceApi
                        .trackSearchEvent(value.trim())
                        .catch(() => {});
                }
            }, 300);
        },
        [patchSearchParams],
    );

    const maxSliderValue =
        filterParams.maxPrice != null ? filterParams.maxPrice : MARKETPLACE_PRICE_CAP;
    const minInputValue = filterParams.minPrice ?? 0;
    const activeTag = (filterParams.q ?? "").replace(/^#/, "").trim();

    const handleApplyPrice = useCallback(
        (minValue: number, maxValue: number) => {
            const minClamped = Math.max(
                0,
                Math.min(minValue, MARKETPLACE_PRICE_CAP),
            );
            const maxClamped = Math.max(
                0,
                Math.min(maxValue, MARKETPLACE_PRICE_CAP),
            );
            const safeMin = Math.min(minClamped, maxClamped);
            const safeMax = Math.max(minClamped, maxClamped);
            patchSearchParams({
                minPrice: safeMin > 0 ? String(safeMin) : undefined,
                maxPrice:
                    safeMax > 0 && safeMax < MARKETPLACE_PRICE_CAP
                        ? String(safeMax)
                        : undefined,
            });
        },
        [patchSearchParams],
    );

    const handleTagClick = useCallback(
        (tag: string) => {
            setDraftQ(tag);
            patchSearchParams({ q: tag });
            void marketplaceApi.trackSearchEvent(tag).catch(() => {});
        },
        [patchSearchParams],
    );

    useEffect(() => {
        let cancelled = false;
        void marketplaceApi
            .listCategories({ onlyWithPublishedProducts: true })
            .then((data) => {
                if (!cancelled) setCategories(data);
            })
            .catch(() => {});
        void marketplaceApi
            .getRecommendations(8)
            .then((data) => {
                if (!cancelled && data.tags.length > 0) {
                    setTags(data.tags);
                }
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

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
                const useRelevanceFeed =
                    pageToFetch === 1 &&
                    filterParams.sort === "relevance" &&
                    !filterParams.categoryId &&
                    filterParams.minPrice == null &&
                    filterParams.maxPrice == null &&
                    filterParams.ratingFilter == null;

                if (useRelevanceFeed) {
                    setIsLoading(true);
                    setError(null);
                    const recommendationData =
                        await marketplaceApi.getRecommendations(24);
                    if (cancelled) return;
                    setUseRecommendationFeed(true);
                    setItems(recommendationData.products);
                    setTotal(recommendationData.products.length);
                    setTags(recommendationData.tags);
                    setCategories((prev) =>
                        prev.length > 0 ? prev : recommendationData.categories,
                    );
                    return;
                }

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
                setUseRecommendationFeed(false);
                setItems((prev) =>
                    pageToFetch === 1 ? data.items : [...prev, ...data.items],
                );
            } catch {
                if (!cancelled) {
                    setError(t("marketplace.loadProductsError"));
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
    }, [filterSignature, listPage, t]);

    const hasMore =
        !isLoading && !useRecommendationFeed && items.length > 0 && items.length < total;

    const handleLoadMore = useCallback(() => {
        if (!hasMore || isLoadingMore) return;
        setListPage((p) => p + 1);
    }, [hasMore, isLoadingMore]);

    return {
        filterParams,
        draftQ,
        categories,
        minInputValue,
        maxSliderValue,
        activeTag,
        tags,
        useRecommendationFeed,
        items,
        isLoading,
        error,
        isLoadingMore,
        hasMore,
        handleSearchInput,
        patchSearchParams,
        handleApplyPrice,
        handleTagClick,
        handleLoadMore,
    };
}
