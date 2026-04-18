import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { feedApi } from "../../feed/api/feedApi";
import type { FeedComment, FeedPost } from "../../feed/types/feed.types";
import { normalizeFeedPost } from "../../feed/utils/normalizeFeedPost";
import { marketplaceApi } from "../../marketplace/api/marketplaceApi";
import { MARKETPLACE_PRICE_CAP } from "../../marketplace/components/MarketplaceSidebar";
import type {
    ProductListItem,
    ProductQueryParams,
} from "../../marketplace/types/marketplace.types";
import { searchApi, type UnifiedSearchResponse } from "../api/searchApi";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { DEFAULT_USER_AVATAR_URL } from "../../../shared/config/defaultAssets";

export type SearchTab = "all" | "products" | "posts" | "people";
export type SourceScope = "all" | "follower" | "followee";

function asObject(value: unknown): Record<string, unknown> {
    return value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : {};
}

function readString(
    obj: Record<string, unknown>,
    keys: string[],
    fallback = "",
): string {
    for (const key of keys) {
        const raw = obj[key];
        if (typeof raw === "string" && raw.trim()) return raw.trim();
    }
    return fallback;
}

function readNumber(
    obj: Record<string, unknown>,
    keys: string[],
): number | null {
    for (const key of keys) {
        const raw = obj[key];
        if (typeof raw === "number" && Number.isFinite(raw)) return raw;
        if (typeof raw === "string" && raw.trim()) {
            const parsed = Number(raw);
            if (Number.isFinite(parsed)) return parsed;
        }
    }
    return null;
}

function readId(obj: Record<string, unknown>, fallback: string): string {
    const idRaw = obj.id;
    if (typeof idRaw === "string" || typeof idRaw === "number")
        return String(idRaw);
    return fallback;
}

export function readImageUrl(obj: Record<string, unknown>): string {
    const primary = readString(obj, [
        "imageUrl",
        "avatarUrl",
        "photoUrl",
        "avatar",
    ]);
    if (primary) return primary;
    const images = obj.images;
    if (Array.isArray(images) && images.length > 0) {
        const first = asObject(images[0]);
        const imageUrl = readString(first, ["imageUrl", "url"]);
        if (imageUrl) return imageUrl;
    }
    return DEFAULT_USER_AVATAR_URL;
}

function toProductListItem(
    item: unknown,
    fallbackId: string,
): ProductListItem | null {
    const value = asObject(item);
    const id = readId(value, fallbackId);
    const name = readString(value, ["name", "title"], "Untitled product");
    if (!id || !name) return null;

    const priceValue = readNumber(value, ["price"]);
    return {
        id,
        name,
        imageUrl: readImageUrl(value),
        rating: readNumber(value, ["rating", "avgRating"]) ?? 0,
        soldCount: readNumber(value, ["soldCount"]) ?? 0,
        price: priceValue ?? 0,
    };
}

function toStartOfDayIso(dateValue: string) {
    if (!dateValue) return undefined;
    const date = new Date(`${dateValue}T00:00:00.000`);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toEndOfDayIso(dateValue: string) {
    if (!dateValue) return undefined;
    const date = new Date(`${dateValue}T23:59:59.999`);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function useSearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuthSession();
    const q = (searchParams.get("q") ?? "").trim();
    const [draftQuery, setDraftQuery] = useState(q);

    useEffect(() => {
        setDraftQuery(q);
    }, [q]);

    const [activeTab, setActiveTab] = useState<SearchTab>("all");

    const [allLoading, setAllLoading] = useState(false);
    const [allError, setAllError] = useState<string | null>(null);
    const [allResult, setAllResult] = useState<UnifiedSearchResponse | null>(null);

    const [productsLoading, setProductsLoading] = useState(false);
    const [productsLoadingMore, setProductsLoadingMore] = useState(false);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [productItems, setProductItems] = useState<ProductListItem[]>([]);
    const [productTotal, setProductTotal] = useState(0);
    const [productPage, setProductPage] = useState(1);
    const [productSort, setProductSort] =
        useState<NonNullable<ProductQueryParams["sort"]>>("relevance");
    const [ratingFilter, setRatingFilter] =
        useState<ProductQueryParams["ratingFilter"]>(undefined);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(MARKETPLACE_PRICE_CAP);
    const [productTags, setProductTags] = useState<string[]>([]);

    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [postsSource, setPostsSource] = useState<SourceScope>("all");
    const [postsFromDate, setPostsFromDate] = useState("");
    const [postsToDate, setPostsToDate] = useState("");
    const [postItems, setPostItems] = useState<FeedPost[]>([]);

    const [peopleLoading, setPeopleLoading] = useState(false);
    const [peopleError, setPeopleError] = useState<string | null>(null);
    const [peopleSource, setPeopleSource] = useState<SourceScope>("all");
    const [peopleResult, setPeopleResult] = useState<UnifiedSearchResponse | null>(
        null,
    );

    const resetProductState = useCallback(() => {
        setProductsError(null);
        setProductItems([]);
        setProductTotal(0);
        setProductPage(1);
        setProductSort("relevance");
        setRatingFilter(undefined);
        setMinPrice(0);
        setMaxPrice(MARKETPLACE_PRICE_CAP);
        setProductTags([]);
    }, []);

    const switchTab = useCallback(
        (nextTab: SearchTab) => {
            if (activeTab === nextTab) return;
            if (activeTab === "products") resetProductState();
            setActiveTab(nextTab);
        },
        [activeTab, resetProductState],
    );

    useEffect(() => {
        if (!q || activeTab !== "all") {
            if (!q) {
                setAllResult(null);
                setAllError(null);
            }
            return;
        }
        let cancelled = false;
        setAllLoading(true);
        setAllError(null);
        void searchApi
            .search(q, { limit: 5 })
            .then((data) => {
                if (!cancelled) setAllResult(data);
            })
            .catch(() => {
                if (!cancelled) setAllError("Unable to search right now.");
            })
            .finally(() => {
                if (!cancelled) setAllLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [activeTab, q]);

    useEffect(() => {
        if (!q || activeTab !== "products") {
            if (!q) {
                setProductItems([]);
                setProductTotal(0);
                setProductsError(null);
                setProductTags([]);
            }
            return;
        }

        let cancelled = false;
        if (productPage === 1) {
            setProductsLoading(true);
            setProductsError(null);
        } else setProductsLoadingMore(true);

        void marketplaceApi
            .listProducts({
                q,
                page: productPage,
                pageSize: 10,
                sort: productSort,
                ratingFilter,
                minPrice: minPrice > 0 ? minPrice : undefined,
                maxPrice: maxPrice < MARKETPLACE_PRICE_CAP ? maxPrice : undefined,
            })
            .then((data) => {
                if (cancelled) return;
                setProductTotal(data.total);
                setProductItems((prev) =>
                    productPage === 1 ? data.items : [...prev, ...data.items],
                );
                if (productPage === 1) {
                    const tags = Array.from(
                        new Set(
                            data.items
                                .flatMap((item) => item.metaKeywords ?? [])
                                .map((tag) => tag.trim())
                                .filter((tag) => tag.length > 0),
                        ),
                    ).slice(0, 12);
                    setProductTags(tags);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setProductsError("Unable to load products right now.");
                    if (productPage === 1) {
                        setProductItems([]);
                        setProductTotal(0);
                    }
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setProductsLoading(false);
                    setProductsLoadingMore(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [activeTab, maxPrice, minPrice, productPage, productSort, q, ratingFilter]);

    useEffect(() => {
        if (!q || activeTab !== "posts") {
            if (!q) {
                setPostItems([]);
                setPostsError(null);
            }
            return;
        }
        let cancelled = false;
        setPostsLoading(true);
        setPostsError(null);
        void searchApi
            .search(q, {
                limit: 10,
                types: ["posts"],
                postsSource,
                postsSort: "latest",
                postedFrom: toStartOfDayIso(postsFromDate),
                postedTo: toEndOfDayIso(postsToDate),
            })
            .then((data) => {
                if (cancelled) return;
                const normalized = data.posts.items.map((item) =>
                    normalizeFeedPost(asObject(item)),
                );
                setPostItems(normalized);
            })
            .catch(() => {
                if (!cancelled) setPostsError("Unable to load posts right now.");
            })
            .finally(() => {
                if (!cancelled) setPostsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [activeTab, postsFromDate, postsSource, postsToDate, q]);

    useEffect(() => {
        if (!q || activeTab !== "people") {
            if (!q) {
                setPeopleResult(null);
                setPeopleError(null);
            }
            return;
        }
        let cancelled = false;
        setPeopleLoading(true);
        setPeopleError(null);
        void searchApi
            .search(q, {
                limit: 10,
                types: ["users"],
                peopleSource,
            })
            .then((data) => {
                if (!cancelled) setPeopleResult(data);
            })
            .catch(() => {
                if (!cancelled) setPeopleError("Unable to load people right now.");
            })
            .finally(() => {
                if (!cancelled) setPeopleLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [activeTab, peopleSource, q]);

    const allSummary = useMemo(() => {
        if (!allResult) return 0;
        return (
            allResult.products.total + allResult.users.total + allResult.posts.total
        );
    }, [allResult]);
    const allProductItems = useMemo(
        () =>
            (allResult?.products.items ?? [])
                .map((item, idx) => toProductListItem(item, `all-product-${idx}`))
                .filter((item): item is ProductListItem => item !== null),
        [allResult],
    );

    const productHasMore =
        productItems.length > 0 && productItems.length < productTotal;
    const peopleItems = peopleResult?.users.items ?? [];

    const handleApplyPrice = useCallback((nextMin: number, nextMax: number) => {
        const min = Math.max(0, Math.min(nextMin, MARKETPLACE_PRICE_CAP));
        const max = Math.max(0, Math.min(nextMax, MARKETPLACE_PRICE_CAP));
        setMinPrice(Math.min(min, max));
        setMaxPrice(Math.max(min, max));
        setProductPage(1);
    }, []);

    const handleProductTag = useCallback(
        (tag: string) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("q", tag);
                return next;
            });
        },
        [setSearchParams],
    );

    const handleLikePost = useCallback(async (postId: string) => {
        setPostItems((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                          ...post,
                          likedByMe: !post.likedByMe,
                          likesCount: post.likedByMe
                              ? Math.max(0, post.likesCount - 1)
                              : post.likesCount + 1,
                      }
                    : post,
            ),
        );
        try {
            await feedApi.likePost(postId);
        } catch {
            setPostItems((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              likedByMe: !post.likedByMe,
                              likesCount: post.likedByMe
                                  ? Math.max(0, post.likesCount - 1)
                                  : post.likesCount + 1,
                          }
                        : post,
                ),
            );
        }
    }, []);

    const handleCommentPost = useCallback(
        async (postId: string, content: string) => {
            const optimistic: FeedComment = {
                id: `temp-${Date.now()}`,
                content,
                createdAt: new Date().toISOString(),
                user: {
                    id: user?.id ?? "me",
                    email: user?.email ?? "me@local",
                    fullName: user?.fullName ?? "You",
                    username: user?.username,
                    avatarUrl: user?.avatarUrl,
                },
            };
            setPostItems((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              commentsCount: post.commentsCount + 1,
                              comments: [optimistic, ...(post.comments ?? [])],
                          }
                        : post,
                ),
            );

            try {
                const created = await feedApi.addComment(postId, content);
                setPostItems((prev) =>
                    prev.map((post) =>
                        post.id === postId
                            ? {
                                  ...post,
                                  comments: (post.comments ?? []).map((comment) =>
                                      comment.id === optimistic.id ? created : comment,
                                  ),
                              }
                            : post,
                    ),
                );
            } catch {
                setPostItems((prev) =>
                    prev.map((post) =>
                        post.id === postId
                            ? {
                                  ...post,
                                  commentsCount: Math.max(0, post.commentsCount - 1),
                                  comments: (post.comments ?? []).filter(
                                      (comment) => comment.id !== optimistic.id,
                                  ),
                              }
                            : post,
                    ),
                );
            }
        },
        [user],
    );

    const submitSearch = useCallback(
        (value: string) => {
            const next = value.trim();
            if (!next) return;
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set("q", next);
                return params;
            });
        },
        [setSearchParams],
    );

    const handleDeletePost = useCallback(async (postId: string) => {
        await feedApi.deletePost(postId);
        setPostItems((prev) => prev.filter((p) => p.id !== postId));
    }, []);

    return {
        q,
        draftQuery,
        setDraftQuery,
        activeTab,
        switchTab,
        allLoading,
        allError,
        allResult,
        allSummary,
        allProductItems,
        productsLoading,
        productsLoadingMore,
        productsError,
        productItems,
        productTotal,
        productHasMore,
        productSort,
        setProductSort,
        setProductPage,
        ratingFilter,
        setRatingFilter,
        minPrice,
        maxPrice,
        handleApplyPrice,
        productTags,
        handleProductTag,
        postsLoading,
        postsError,
        postsSource,
        setPostsSource,
        postsFromDate,
        setPostsFromDate,
        postsToDate,
        setPostsToDate,
        postItems,
        handleLikePost,
        handleCommentPost,
        handleDeletePost,
        peopleLoading,
        peopleError,
        peopleSource,
        setPeopleSource,
        peopleResult,
        peopleItems,
        submitSearch,
        readImageUrl,
    };
}
