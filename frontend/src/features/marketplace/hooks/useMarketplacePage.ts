import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { marketplaceApi } from "../api/marketplaceApi";
import { productApi } from "../../product/api/productApi";
import { queryKeys } from "../../../shared/query/queryKeys";
import { MARKETPLACE_PRICE_CAP } from "../components/MarketplaceSidebar";
import type {
    MarketplaceCategoryOption,
    ProductQueryParams,
} from "../types/marketplace.types";
import { parseRatingFilter, parseSort } from "../utils/marketplaceFilters";

const PAGE_SIZE = 12;

function appendUniqueById<T extends { id: string }>(prev: T[], next: T[]) {
    if (prev.length === 0) {
        return next;
    }
    const seen = new Set(prev.map((item) => item.id));
    const merged = [...prev];
    for (const item of next) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
    }
    return merged;
}

export function useMarketplacePage() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuthSession();
    const queryClient = useQueryClient();
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

    const productsKey = queryKeys.marketplace.products(filterSignature);
    const categoriesQuery = useQuery({
        queryKey: queryKeys.marketplace.categories,
        queryFn: () => marketplaceApi.listCategories({ onlyWithPublishedProducts: true }),
    });
    const recommendationsQuery = useQuery({
        queryKey: queryKeys.marketplace.recommendations(isAuthenticated),
        enabled: isAuthenticated,
        queryFn: () => marketplaceApi.getRecommendations({ page: 1, limit: PAGE_SIZE }),
    });
    const isRecommendationFeed = useMemo(
        () =>
            isAuthenticated &&
            filterParams.sort === "relevance" &&
            !filterParams.categoryId &&
            filterParams.minPrice == null &&
            filterParams.maxPrice == null &&
            filterParams.ratingFilter == null,
        [filterParams, isAuthenticated],
    );
    const productsQuery = useInfiniteQuery({
        queryKey: productsKey,
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            marketplaceApi.listProducts({
                ...filterParams,
                page: pageParam,
            }),
        getNextPageParam(lastPage) {
            const hasMore = lastPage.page * lastPage.pageSize < lastPage.total;
            return hasMore ? lastPage.page + 1 : undefined;
        },
    });

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
                if (isAuthenticated && value.trim().length >= 2) {
                    void marketplaceApi
                        .trackSearchEvent(value.trim())
                        .catch(() => {});
                }
            }, 300);
        },
        [isAuthenticated, patchSearchParams],
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
            if (isAuthenticated) {
                void marketplaceApi.trackSearchEvent(tag).catch(() => {});
            }
        },
        [isAuthenticated, patchSearchParams],
    );

    const handleLoadMore = useCallback(() => {
        if (isRecommendationFeed) return;
        if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
            void productsQuery.fetchNextPage();
        }
    }, [isRecommendationFeed, productsQuery]);

    const prefetchProductDetail = useCallback(
        (productId: string) => {
            void queryClient.prefetchQuery({
                queryKey: queryKeys.product.detail(productId),
                queryFn: () => productApi.getProductDetail(productId),
                staleTime: 30_000,
            });
        },
        [queryClient],
    );

    const items = useMemo(() => {
        if (isRecommendationFeed) {
            return recommendationsQuery.data?.products ?? [];
        }
        const pages = productsQuery.data?.pages ?? [];
        return pages.reduce<
            Awaited<ReturnType<typeof marketplaceApi.listProducts>>["items"]
        >((acc, page) => appendUniqueById(acc, page.items), []);
    }, [isRecommendationFeed, productsQuery.data?.pages, recommendationsQuery.data?.products]);
    const total = isRecommendationFeed
        ? (recommendationsQuery.data?.total ?? 0)
        : (productsQuery.data?.pages[0]?.total ?? 0);
    const hasMore = isRecommendationFeed
        ? Boolean(recommendationsQuery.data?.hasMore)
        : Boolean(productsQuery.hasNextPage);
    const categories: MarketplaceCategoryOption[] =
        categoriesQuery.data ??
        recommendationsQuery.data?.categories ??
        [];
    const tags = isAuthenticated ? recommendationsQuery.data?.tags ?? [] : [];
    const isLoading =
        isRecommendationFeed
            ? recommendationsQuery.isLoading
            : productsQuery.isLoading;
    const isLoadingMore = productsQuery.isFetchingNextPage;
    const error =
        isRecommendationFeed
            ? (recommendationsQuery.isError ? t("marketplace.loadProductsError") : null)
            : (productsQuery.isError ? t("marketplace.loadProductsError") : null);

    return {
        filterParams,
        draftQ,
        categories,
        minInputValue,
        maxSliderValue,
        activeTag,
        tags,
        useRecommendationFeed: isRecommendationFeed,
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
        prefetchProductDetail,
    };
}
