import { Bookmark, Loader2, Package, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { savedItemsApi } from "../features/saved-items/api/savedItemsApi";
import type {
    PriceSort,
    SavedItemRow,
    SavedTab,
} from "../features/saved-items/types/savedItems.types";
import { httpClient } from "../shared/api/httpClient";
import { formatCurrencyVnd } from "../shared/lib/formatCurrencyVnd";
import { truncatePlainPreview } from "../shared/tiptap/postHtmlUtils";

interface CategoryOption {
    id: string;
    name: string;
}

function postImageUrl(row: SavedItemRow): string | undefined {
    const urls = row.post?.mediaUrls;
    if (urls && urls.length > 0) return urls[0];
    const pImg = row.post?.product?.images?.[0]?.imageUrl;
    return pImg ?? undefined;
}

function productImageUrl(row: SavedItemRow): string | undefined {
    return row.product?.images?.[0]?.imageUrl;
}

export default function SavedItems() {
    const [tab, setTab] = useState<SavedTab>("all");
    const [q, setQ] = useState("");
    const [searchDraft, setSearchDraft] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [priceBand, setPriceBand] = useState<
        "" | "under50" | "50to150" | "over150"
    >("");
    const [sort, setSort] = useState<PriceSort>("recent");
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [items, setItems] = useState<SavedItemRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
    const [removingId, setRemovingId] = useState<string | null>(null);

    const minMaxFromBand = () => {
        switch (priceBand) {
            case "under50":
                return { minPrice: undefined, maxPrice: "50" };
            case "50to150":
                return { minPrice: "50", maxPrice: "150" };
            case "over150":
                return { minPrice: "150", maxPrice: undefined };
            default:
                return { minPrice: undefined, maxPrice: undefined };
        }
    };

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { minPrice, maxPrice } = minMaxFromBand();
        try {
            const res = await savedItemsApi.list({
                type: tab,
                page,
                limit: 24,
                q: q || undefined,
                categoryId: categoryId || undefined,
                minPrice,
                maxPrice,
                sort: tab === "posts" ? "recent" : sort,
            });
            setItems(res.items);
            setPagination({
                total: res.pagination?.total ?? 0,
                totalPages: res.pagination?.totalPages ?? 0,
            });
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to load saved items",
            );
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [tab, page, q, categoryId, priceBand, sort]);

    useEffect(() => {
        void (async () => {
            try {
                const res = await httpClient.get<{
                    success?: boolean;
                    data?: CategoryOption[];
                }>("/categories");
                setCategories(Array.isArray(res.data) ? res.data : []);
            } catch {
                setCategories([]);
            }
        })();
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [tab, q, categoryId, priceBand, sort]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setQ(searchDraft);
    };

    const handleUnsave = async (savedRowId: string) => {
        setRemovingId(savedRowId);
        try {
            await savedItemsApi.remove(savedRowId);
            setItems((prev) => prev.filter((r) => r.id !== savedRowId));
            setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
        } finally {
            setRemovingId(null);
        }
    };

    const showProductFilters = tab === "all" || tab === "products";
    const isEmpty = !loading && items.length === 0 && !error;

    return (
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8 md:px-12 md:py-12 lg:px-16">
                <section className="w-full">
                    <header className="mb-8">
                        <h1 className="mb-8 text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
                            Saved Items
                        </h1>
                        <nav
                            aria-label="Saved filters"
                            className="flex flex-wrap gap-6 border-b border-neutral-200 dark:border-neutral-800"
                        >
                            {(
                                [
                                    { id: "all" as const, label: "All Items" },
                                    {
                                        id: "products" as const,
                                        label: "Products",
                                    },
                                    {
                                        id: "posts" as const,
                                        label: "Editorial Posts",
                                    },
                                ] as const
                            ).map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTab(t.id)}
                                    className={`pb-4 text-sm font-semibold transition-colors ${
                                        tab === t.id
                                            ? "border-b-2 border-primary font-bold text-primary"
                                            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </nav>
                    </header>

                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative min-w-0 flex-1"
                        >
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                            <input
                                value={searchDraft}
                                onChange={(e) => setSearchDraft(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 shadow-sm outline-none ring-primary/30 transition placeholder:text-neutral-400 focus:border-primary focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                                placeholder="Search in saved"
                                aria-label="Search saved items"
                            />
                        </form>

                        {showProductFilters ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <label
                                    className="sr-only"
                                    htmlFor="saved-filter-category"
                                >
                                    Category
                                </label>
                                <select
                                    id="saved-filter-category"
                                    value={categoryId}
                                    onChange={(e) =>
                                        setCategoryId(e.target.value)
                                    }
                                    className="rounded-xl border border-neutral-200 bg-white py-2.5 pl-3 pr-3 text-sm font-medium text-neutral-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="">All categories</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                <label
                                    className="sr-only"
                                    htmlFor="saved-filter-price"
                                >
                                    Price
                                </label>
                                <select
                                    id="saved-filter-price"
                                    value={priceBand}
                                    onChange={(e) =>
                                        setPriceBand(
                                            e.target.value as typeof priceBand,
                                        )
                                    }
                                    className="rounded-xl border border-neutral-200 bg-white py-2.5 pl-3 pr-3 text-sm font-medium text-neutral-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="">All prices</option>
                                    <option value="under50">Dưới {formatCurrencyVnd(50)}</option>
                                    <option value="50to150">{formatCurrencyVnd(50)} – {formatCurrencyVnd(150)}</option>
                                    <option value="over150">Trên {formatCurrencyVnd(150)}</option>
                                </select>

                                <label
                                    className="sr-only"
                                    htmlFor="saved-filter-sort"
                                >
                                    Sort
                                </label>
                                <select
                                    id="saved-filter-sort"
                                    value={sort}
                                    onChange={(e) =>
                                        setSort(e.target.value as PriceSort)
                                    }
                                    className="rounded-xl border border-neutral-200 bg-white py-2.5 pl-3 pr-3 text-sm font-medium text-neutral-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="recent">Recent</option>
                                    <option value="price_asc">
                                        Price: low to high
                                    </option>
                                    <option value="price_desc">
                                        Price: high to low
                                    </option>
                                </select>
                            </div>
                        ) : null}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20 text-neutral-500 dark:text-neutral-400">
                            <Loader2
                                className="h-8 w-8 animate-spin text-primary"
                                aria-hidden
                            />
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                            {error}
                        </div>
                    ) : isEmpty ? (
                        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-neutral-200 bg-white px-8 py-16 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:px-12 md:py-20">
                            <div className="relative mb-10">
                                <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
                                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/80">
                                    <Bookmark className="h-16 w-16 text-primary/40 dark:text-primary/50" />
                                </div>
                            </div>
                            <h2 className="mb-3 text-2xl font-extrabold">
                                Your collection is empty
                            </h2>
                            <p className="mb-8 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
                                Save products and posts you love—they’ll show up
                                here for quick access anytime.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link
                                    to="/feed"
                                    className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                                >
                                    Explore Feed
                                </Link>
                                <Link
                                    to="/marketplace"
                                    className="rounded-full border border-neutral-200 bg-background-light px-6 py-2.5 text-sm font-bold transition hover:bg-neutral-100 dark:border-neutral-600 dark:bg-background-dark dark:hover:bg-neutral-800"
                                >
                                    Browse Products
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {items.map((row) =>
                                    row.itemType === "PRODUCT" &&
                                    row.product ? (
                                        <article
                                            key={row.id}
                                            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                <Link
                                                    to={`/products/${row.product.id}`}
                                                    className="block h-full w-full"
                                                >
                                                    {productImageUrl(row) ? (
                                                        <img
                                                            src={productImageUrl(row)!}
                                                            alt={row.product.title}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                                                            <Package className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                                                        </div>
                                                    )}
                                                </Link>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        removingId === row.id
                                                    }
                                                    onClick={() =>
                                                        void handleUnsave(
                                                            row.id,
                                                        )
                                                    }
                                                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-md backdrop-blur transition hover:scale-110 disabled:opacity-50 dark:bg-neutral-900/90"
                                                    aria-label="Remove from saved"
                                                >
                                                    <Bookmark className="h-5 w-5 fill-current" />
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                <Link
                                                    to={`/products/${row.product.id}`}
                                                    className="line-clamp-2 font-bold text-neutral-900 hover:text-primary dark:text-neutral-100"
                                                >
                                                    {row.product.title}
                                                </Link>
                                                <p className="mt-2 text-lg font-black text-primary">
                                                    {typeof row.product.price === "number"
                                                        ? formatCurrencyVnd(row.product.price)
                                                        : "—"}
                                                </p>
                                                {row.product.seller ? (
                                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                        {row.product.seller
                                                            .fullName ??
                                                            row.product.seller
                                                                .username}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </article>
                                    ) : row.post ? (
                                        <article
                                            key={row.id}
                                            className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                                        >
                                            <div className="relative aspect-4/3 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                <Link
                                                    to={`/post/${row.post.id}`}
                                                    className="block h-full w-full"
                                                >
                                                    {postImageUrl(row) ? (
                                                        <img
                                                            src={postImageUrl(
                                                                row,
                                                            )}
                                                            alt=""
                                                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <Package className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                                                        </div>
                                                    )}
                                                </Link>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        removingId === row.id
                                                    }
                                                    onClick={() =>
                                                        void handleUnsave(
                                                            row.id,
                                                        )
                                                    }
                                                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-md backdrop-blur dark:bg-neutral-900/90"
                                                    aria-label="Remove from saved"
                                                >
                                                    <Bookmark className="h-5 w-5 fill-current" />
                                                </button>
                                            </div>
                                            <div className="flex flex-1 flex-col p-4">
                                                <p className="mb-2 line-clamp-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                                    {truncatePlainPreview(
                                                        row.post.content,
                                                        120,
                                                    )}
                                                </p>
                                                <div className="mt-auto flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                                    <span>
                                                        {row.post.author
                                                            ?.fullName ??
                                                            row.post.author
                                                                ?.username}
                                                    </span>
                                                    <span>
                                                        {row.post._count
                                                            ?.likes ??
                                                            row.post
                                                                .likesCount ??
                                                            0}{" "}
                                                        likes
                                                    </span>
                                                </div>
                                                <Link
                                                    to={`/post/${row.post.id}`}
                                                    className="mt-3 text-xs font-bold text-primary hover:underline"
                                                >
                                                    Read post
                                                </Link>
                                            </div>
                                        </article>
                                    ) : null,
                                )}
                            </div>

                            {pagination.totalPages > 1 ? (
                                <div className="mt-10 flex justify-center gap-2">
                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        Previous
                                    </button>
                                    <span className="flex items-center px-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        Page {page} of{" "}
                                        {pagination.totalPages || 1}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={page >= pagination.totalPages}
                                        onClick={() =>
                                            setPage((p) =>
                                                pagination.totalPages
                                                    ? Math.min(
                                                          pagination.totalPages,
                                                          p + 1,
                                                      )
                                                    : p + 1,
                                            )
                                        }
                                        className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        Next
                                    </button>
                                </div>
                            ) : null}
                        </>
                    )}
                </section>
        </main>
    );
}
