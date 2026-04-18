import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { DEFAULT_USER_AVATAR_URL } from "../shared/config/defaultAssets";
import { marketplaceApi } from "../features/marketplace/api/marketplaceApi";
import {
    MARKETPLACE_PRICE_CAP,
    MarketplaceSidebar,
} from "../features/marketplace/components/MarketplaceSidebar";
import { MarketplaceSortMenu } from "../features/marketplace/components/MarketplaceSortMenu";
import { SearchResults } from "../features/marketplace/components/SearchResults";
import type {
    ProductListItem,
    ProductQueryParams,
} from "../features/marketplace/types/marketplace.types";
import { feedApi } from "../features/feed/api/feedApi";
import { FeedPostCard } from "../features/feed/components/FeedPostCard";
import type { FeedComment, FeedPost } from "../features/feed/types/feed.types";
import { normalizeFeedPost } from "../features/feed/utils/normalizeFeedPost";
import {
    searchApi,
    type UnifiedSearchResponse,
} from "../features/search/api/searchApi";
import { Avatar, UnifiedHeader } from "../shared/ui";

type SearchTab = "all" | "products" | "posts" | "people";
type SourceScope = "all" | "follower" | "followee";

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

function readId(obj: Record<string, unknown>, fallback: string): string {
    const idRaw = obj.id;
    if (typeof idRaw === "string" || typeof idRaw === "number")
        return String(idRaw);
    return fallback;
}

function readImageUrl(obj: Record<string, unknown>): string {
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

export default function SearchPage() {
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
    const [allResult, setAllResult] = useState<UnifiedSearchResponse | null>(
        null,
    );

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
    const [peopleResult, setPeopleResult] =
        useState<UnifiedSearchResponse | null>(null);

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
                maxPrice:
                    maxPrice < MARKETPLACE_PRICE_CAP ? maxPrice : undefined,
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
    }, [
        activeTab,
        maxPrice,
        minPrice,
        productPage,
        productSort,
        q,
        ratingFilter,
    ]);

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
                if (!cancelled)
                    setPostsError("Unable to load posts right now.");
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
                if (!cancelled)
                    setPeopleError("Unable to load people right now.");
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
            allResult.products.total +
            allResult.users.total +
            allResult.posts.total
        );
    }, [allResult]);
    const allProductItems = useMemo(
        () =>
            (allResult?.products.items ?? [])
                .map((item, idx) =>
                    toProductListItem(item, `all-product-${idx}`),
                )
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
                                  ? post.likesCount + 1
                                  : Math.max(0, post.likesCount - 1),
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
                                  comments: (post.comments ?? []).map(
                                      (comment) =>
                                          comment.id === optimistic.id
                                              ? created
                                              : comment,
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
                                  commentsCount: Math.max(
                                      0,
                                      post.commentsCount - 1,
                                  ),
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

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <UnifiedHeader
                activePath="/marketplace"
                searchValue={draftQuery}
                onSearch={setDraftQuery}
                onSearchSubmit={(value) => {
                    const next = value.trim();
                    if (!next) return;
                    setSearchParams((prev) => {
                        const params = new URLSearchParams(prev);
                        params.set("q", next);
                        return params;
                    });
                }}
            />
            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="mb-6 text-3xl font-extrabold">
                        Search Results for:{" "}
                        <span className="text-primary">
                            {q ? `'${q}'` : "'...'"}
                        </span>
                    </h1>
                    <div className="flex items-center gap-8 overflow-x-auto border-b border-border whitespace-nowrap">
                        {[
                            { id: "all", label: "All Results" },
                            { id: "products", label: "Products" },
                            { id: "posts", label: "Posts" },
                            { id: "people", label: "People" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => switchTab(tab.id as SearchTab)}
                                className={`border-b-2 px-2 pb-4 text-sm font-bold transition-colors ${
                                    activeTab === tab.id
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-primary"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {!q ? (
                    <p className="text-sm text-muted-foreground">
                        Enter a keyword in the header search to start.
                    </p>
                ) : null}

                {activeTab === "all" ? (
                    <div className="space-y-8">
                        {allLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading...
                            </p>
                        ) : null}
                        {allError ? (
                            <p className="text-sm text-destructive">
                                {allError}
                            </p>
                        ) : null}
                        {!allLoading && !allError && allResult ? (
                            <p className="text-sm text-muted-foreground">
                                Found {allSummary} results.
                            </p>
                        ) : null}

                        {allResult ? (
                            <div className="space-y-12">
                                <section>
                                    <div className="mb-6 flex items-center justify-between">
                                        <h2 className="flex items-center gap-2 text-xl font-bold">
                                            Top Products
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] tracking-widest text-primary uppercase">
                                                Marketplace
                                            </span>
                                        </h2>
                                    </div>
                                    {allResult.products.items.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No products found.
                                        </p>
                                    ) : (
                                        <SearchResults
                                            items={allProductItems}
                                            isLoading={false}
                                            error={null}
                                        />
                                    )}
                                </section>

                                <section className="space-y-6">
                                    <h2 className="text-xl font-bold">
                                        Related People
                                    </h2>
                                    {allResult.users.items.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No users found.
                                        </p>
                                    ) : (
                                        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                                            {allResult.users.items.map(
                                                (item, idx) => {
                                                    const value =
                                                        asObject(item);
                                                    const id = readId(
                                                        value,
                                                        String(idx),
                                                    );
                                                    const username = readString(
                                                        value,
                                                        ["username"],
                                                        "unknown",
                                                    );
                                                    const fullName = readString(
                                                        value,
                                                        ["fullName", "name"],
                                                        username,
                                                    );
                                                    return (
                                                        <div
                                                            key={`all-user-${id}`}
                                                            className="flex items-center justify-between gap-3 p-4"
                                                        >
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <Avatar
                                                                    src={readImageUrl(
                                                                        value,
                                                                    )}
                                                                    alt={
                                                                        fullName
                                                                    }
                                                                    wrapperClassName="size-10"
                                                                />
                                                                <div className="min-w-0">
                                                                    <Link
                                                                        className="font-bold hover:text-primary"
                                                                        to={`/profile/${id}`}
                                                                    >
                                                                        {
                                                                            fullName
                                                                        }
                                                                    </Link>
                                                                    <p className="truncate text-xs text-muted-foreground">
                                                                        @
                                                                        {
                                                                            username
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Link
                                                                to={`/profile/${id}`}
                                                                className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                                                            >
                                                                View
                                                            </Link>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </section>

                                <section className="space-y-6">
                                    <h2 className="text-xl font-bold">
                                        Popular Posts
                                    </h2>
                                    {allResult.posts.items.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No posts found.
                                        </p>
                                    ) : (
                                        <div className="space-y-8">
                                            {allResult.posts.items.map(
                                                (item, idx) => {
                                                    const normalized =
                                                        normalizeFeedPost(
                                                            asObject(item),
                                                        );
                                                    const key =
                                                        normalized.id ||
                                                        `all-post-${idx}`;
                                                    return (
                                                        <FeedPostCard
                                                            key={key}
                                                            post={normalized}
                                                            onLike={() => {}}
                                                            onComment={() => {}}
                                                        />
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </section>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {activeTab === "products" ? (
                    <div className="flex flex-col gap-8 lg:flex-row">
                        <MarketplaceSidebar
                            minPriceValue={minPrice}
                            maxPriceValue={maxPrice}
                            ratingFilter={ratingFilter}
                            onApplyPrice={handleApplyPrice}
                            onRatingFilterChange={(next) => {
                                setRatingFilter(next);
                                setProductPage(1);
                            }}
                            tags={productTags}
                            activeTag={q}
                            onTagClick={handleProductTag}
                        />

                        <div className="min-w-0 flex-1 space-y-6">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <h2 className="text-xl font-bold">Products</h2>
                                <MarketplaceSortMenu
                                    value={productSort}
                                    onChange={(next) => {
                                        setProductSort(next);
                                        setProductPage(1);
                                    }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Found {productTotal} products.
                            </p>
                            <SearchResults
                                items={productItems}
                                isLoading={productsLoading}
                                error={productsError}
                                isLoadingMore={productsLoadingMore}
                                hasMore={productHasMore}
                                onLoadMore={() =>
                                    setProductPage((prev) => prev + 1)
                                }
                            />
                        </div>
                    </div>
                ) : null}

                {activeTab === "posts" ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-4">
                            <label className="text-xs font-semibold text-muted-foreground">
                                Source
                                <select
                                    value={postsSource}
                                    onChange={(e) =>
                                        setPostsSource(
                                            e.target.value as SourceScope,
                                        )
                                    }
                                    className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="all">All</option>
                                    <option value="follower">Followers</option>
                                    <option value="followee">Followees</option>
                                </select>
                            </label>
                            <label className="text-xs font-semibold text-muted-foreground">
                                Sort
                                <select
                                    value="latest"
                                    disabled
                                    className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="latest">Latest</option>
                                </select>
                            </label>
                            <label className="text-xs font-semibold text-muted-foreground">
                                From date
                                <input
                                    type="date"
                                    value={postsFromDate}
                                    onChange={(e) =>
                                        setPostsFromDate(e.target.value)
                                    }
                                    className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                                />
                            </label>
                            <label className="text-xs font-semibold text-muted-foreground">
                                To date
                                <input
                                    type="date"
                                    value={postsToDate}
                                    onChange={(e) =>
                                        setPostsToDate(e.target.value)
                                    }
                                    className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                                />
                            </label>
                        </div>

                        {postsLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading posts...
                            </p>
                        ) : null}
                        {postsError ? (
                            <p className="text-sm text-destructive">
                                {postsError}
                            </p>
                        ) : null}
                        {!postsLoading && !postsError ? (
                            <div className="space-y-8">
                                {postItems.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No posts found.
                                    </p>
                                ) : (
                                    postItems.map((post, idx) => (
                                        <FeedPostCard
                                            key={post.id || `post-only-${idx}`}
                                            post={post}
                                            mode="feed"
                                            onLike={() =>
                                                void handleLikePost(post.id)
                                            }
                                            onComment={(content) =>
                                                handleCommentPost(
                                                    post.id,
                                                    content,
                                                )
                                            }
                                            onDeletePost={async (postId) => {
                                                await feedApi.deletePost(
                                                    postId,
                                                );
                                                setPostItems((prev) =>
                                                    prev.filter(
                                                        (p) => p.id !== postId,
                                                    ),
                                                );
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {activeTab === "people" ? (
                    <div className="space-y-6">
                        <div className="max-w-xs rounded-xl border border-border bg-card p-4">
                            <label className="text-xs font-semibold text-muted-foreground">
                                Source
                                <select
                                    value={peopleSource}
                                    onChange={(e) =>
                                        setPeopleSource(
                                            e.target.value as SourceScope,
                                        )
                                    }
                                    className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="all">All</option>
                                    <option value="follower">Followers</option>
                                    <option value="followee">Followees</option>
                                </select>
                            </label>
                        </div>

                        {peopleLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading people...
                            </p>
                        ) : null}
                        {peopleError ? (
                            <p className="text-sm text-destructive">
                                {peopleError}
                            </p>
                        ) : null}
                        {peopleResult ? (
                            peopleItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No users found.
                                </p>
                            ) : (
                                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                                    {peopleItems.map((item, idx) => {
                                        const value = asObject(item);
                                        const id = readId(value, String(idx));
                                        const username = readString(
                                            value,
                                            ["username"],
                                            "unknown",
                                        );
                                        const fullName = readString(
                                            value,
                                            ["fullName", "name"],
                                            username,
                                        );
                                        return (
                                            <div
                                                key={`people-only-${id}`}
                                                className="flex items-center justify-between gap-3 p-4"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <Avatar
                                                        src={readImageUrl(
                                                            value,
                                                        )}
                                                        alt={fullName}
                                                        wrapperClassName="size-11"
                                                    />
                                                    <div className="min-w-0">
                                                        <Link
                                                            className="font-bold hover:text-primary"
                                                            to={`/profile/${id}`}
                                                        >
                                                            {fullName}
                                                        </Link>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            @{username}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/profile/${id}`}
                                                    className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : null}
                    </div>
                ) : null}
            </main>
        </div>
    );
}
