import { Link } from "react-router-dom";
import {
    MarketplaceSidebar,
} from "../features/marketplace/components/MarketplaceSidebar";
import { MarketplaceSortMenu } from "../features/marketplace/components/MarketplaceSortMenu";
import { SearchResults } from "../features/marketplace/components/SearchResults";
import { FeedPostCard } from "../features/feed/components/FeedPostCard";
import { normalizeFeedPost } from "../features/feed/utils/normalizeFeedPost";
import {
    readImageUrl,
    useSearchPage,
    type SearchTab,
    type SourceScope,
} from "../features/search/hooks/useSearchPage";
import { useConfigureAppHeader } from "../app/layouts/AppHeaderContext";
import { Avatar } from "../shared/ui";

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

export default function SearchPage() {
    const {
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
    } = useSearchPage();

    useConfigureAppHeader({
        searchValue: draftQuery,
        onSearch: setDraftQuery,
        onSearchSubmit: submitSearch,
    });

    return (
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
                                                await handleDeletePost(postId);
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
    );
}
