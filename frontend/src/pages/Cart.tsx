import {
    Bookmark,
    Compass,
    Heart,
    History,
    ShoppingCart,
    Store,
    Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { CartItem } from "../features/cart/components/CartItem";
import { CartSummary } from "../features/cart/components/CartSummary";
import { useCartPage } from "../features/cart/hooks";
import { marketplaceApi } from "../features/marketplace/api/marketplaceApi";
import type { ProductListItem } from "../features/marketplace/types/marketplace.types";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { resolveProfilePath } from "../shared/lib/resolveProfilePath";
import { UnifiedHeader } from "../shared/ui";

function CartProductStrip({
    title,
    columns = "trending",
}: {
    title: string;
    columns?: "trending" | "recommendations";
}) {
    const { t } = useTranslation();
    const [items, setItems] = useState<ProductListItem[]>([]);

    useEffect(() => {
        let cancelled = false;
        void marketplaceApi
            .listProducts({ page: 1, pageSize: 8, sort: "popular" })
            .then((res) => {
                if (!cancelled) setItems(res.items);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    if (items.length === 0) return null;

    const slice =
        columns === "trending" ? items.slice(0, 4) : items.slice(0, 8);
    const gridClass =
        columns === "trending"
            ? "grid grid-cols-2 gap-4 md:grid-cols-4"
            : "grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5";

    return (
        <section className="border-t border-neutral-200 bg-background-light px-6 py-12 dark:border-neutral-800 dark:bg-background-dark">
            <div
                className={
                    columns === "trending"
                        ? "mx-auto max-w-[1200px]"
                        : "mx-auto max-w-[1440px]"
                }
            >
                <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        {title}
                    </h3>
                    <Link
                        to="/marketplace"
                        className="text-sm font-bold text-primary transition-colors hover:text-primary/90"
                    >
                        {t("cart.viewAll")}
                    </Link>
                </div>
                <div className={gridClass}>
                    {slice.map((p) => (
                        <Link
                            key={p.id}
                            to={`/products/${p.id}`}
                            className="group flex flex-col gap-3"
                        >
                            <div className="aspect-square w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                {p.imageUrl ? (
                                    <img
                                        src={p.imageUrl}
                                        alt=""
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                                        {t("cart.noImage")}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="line-clamp-1 text-sm font-bold">
                                    {p.name}
                                </span>
                                <span className="text-sm text-neutral-500">
                                    ${p.price.toFixed(2)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Cart() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthSession();
    const {
        cart,
        isLoading,
        error,
        selectedIds,
        actionError,
        allSelected,
        selectedCount,
        selectedSubtotal,
        setActionError,
        handleSelect,
        handleSelectAll,
        handleQuantityChange,
        handleRemove,
        handleDeleteSelected,
    } = useCartPage();



    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
                
                <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8">
                    <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                        {t("cart.loading")}
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
            
                <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                </main>
            </div>
        );
    }

    const groupCount =
        (cart?.groups ?? []).reduce((n, g) => n + (g.items?.length ?? 0), 0);

    if (!cart || groupCount === 0) {
        return (
            <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
               
                <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                    <div className="mx-auto flex max-w-[480px] flex-col items-center text-center">
                        <div className="relative mb-8 flex h-64 w-64 items-center justify-center rounded-full bg-primary/5 dark:bg-primary/10">
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                <div className="h-48 w-48 rounded-full border-4 border-dashed border-primary" />
                            </div>
                            <div className="relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-3xl bg-white shadow-xl shadow-primary/10 dark:bg-neutral-800 dark:shadow-none">
                                <ShoppingCart
                                    className="h-16 w-16 text-primary/40 dark:text-primary/60"
                                    strokeWidth={1.15}
                                    aria-hidden
                                />
                                <Heart
                                    className="absolute -right-4 -top-4 h-8 w-8 fill-current text-primary"
                                    aria-hidden
                                />
                                <Tag
                                    className="absolute -bottom-2 -left-6 h-10 w-10 text-neutral-300 dark:text-neutral-600"
                                    aria-hidden
                                />
                            </div>
                        </div>
                        <h1 className="mb-3 text-3xl font-bold text-neutral-900 dark:text-white">
                            {t("cart.emptyTitle")}
                        </h1>
                        <p className="mb-10 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                            {t("cart.emptyDescription")}
                        </p>
                        <Link
                            to="/marketplace"
                            className="inline-flex h-14 min-w-[240px] items-center justify-center gap-3 rounded-xl bg-primary px-8 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95"
                        >
                            <Compass className="h-6 w-6" aria-hidden />
                            {t("cart.continueShopping")}
                        </Link>
                        <div className="mt-12 flex flex-wrap justify-center gap-6">
                            <Link
                                to="/orders"
                                className="flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-primary dark:text-neutral-500"
                            >
                                <History className="h-5 w-5" aria-hidden />
                                {t("cart.orderHistory")}
                            </Link>
                            <Link
                                to="/saved-items"
                                className="flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-primary dark:text-neutral-500"
                            >
                                <Bookmark className="h-5 w-5" aria-hidden />
                                {t("cart.savedItems")}
                            </Link>
                        </div>
                    </div>
                </main>
                <CartProductStrip
                    title={t("cart.trendingWithFriends")}
                    columns="trending"
                />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
          
            <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                        {t("cart.title")}{" "}
                        <span className="text-lg font-normal text-neutral-500">
                            ({t("cart.itemCount", { count: cart.itemCount })})
                        </span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {actionError ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                                {actionError}
                            </div>
                        ) : null}

                        <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) =>
                                        handleSelectAll(e.target.checked)
                                    }
                                    className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-700"
                                />
                                <span className="font-medium">
                                    {t("cart.selectAll")}
                                </span>
                            </label>
                            <button
                                type="button"
                                disabled={selectedCount === 0}
                                onClick={() => void handleDeleteSelected()}
                                className="text-sm font-medium text-neutral-500 transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {t("cart.deleteSelected")}
                            </button>
                        </div>

                        {(cart.groups ?? []).map((group) => (
                            <div
                                key={group.sellerId}
                                className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <div className="flex items-center border-b border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={
                                                group.items.length > 0 &&
                                                group.items.every((i) =>
                                                    selectedIds.has(i.id),
                                                )
                                            }
                                            onChange={(e) =>
                                                group.items.forEach((i) =>
                                                    handleSelect(
                                                        i.id,
                                                        e.target.checked,
                                                    ),
                                                )
                                            }
                                            className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-700"
                                        />
                                        <Store
                                            className="h-5 w-5 shrink-0 text-primary"
                                            aria-hidden
                                        />
                                        <Link
                                            to={resolveProfilePath(group.sellerId, user?.id)}
                                            className="font-bold hover:text-primary hover:underline"
                                        >
                                            {group.sellerName}
                                        </Link>
                                        {group.isTopSeller && (
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                                {t("cart.topSeller")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {group.items.map((item) => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            selected={selectedIds.has(item.id)}
                                            onSelect={handleSelect}
                                            onQuantityChange={(id, qty) =>
                                                void handleQuantityChange(
                                                    id,
                                                    qty,
                                                )
                                            }
                                            onRemove={(id) =>
                                                void handleRemove(id)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <CartSummary
                        cart={cart}
                        selectedCount={selectedCount}
                        selectedSubtotal={selectedSubtotal}
                        onCheckout={() => {
                            if (selectedCount === 0) {
                                setActionError(
                                    t("cart.checkoutSelectRequired"),
                                );
                                return;
                            }
                            navigate("/checkout", {
                                state: {
                                    selectedCartItemIds: Array.from(
                                        selectedIds,
                                    ),
                                },
                            });
                        }}
                    />
                </div>

                <div className="-mx-6 mt-16">
                    <CartProductStrip
                        title={t("cart.recentlyViewedRecommended")}
                        columns="recommendations"
                    />
                </div>
            </main>
        </div>
    );
}