import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProductListItem } from "../../marketplace/types/marketplace.types";
import { useTranslation } from "react-i18next";
import { formatCurrencyVnd } from "../../../shared/lib/formatCurrencyVnd";

import { useProfileContext } from "../context/ProfileContext";

export function SellerProfileProductGrid() {
    const { shopProducts: products, isLoading, productCategory: categoryFilter } = useProfileContext();

    const { t } = useTranslation();
    const visible =
        categoryFilter == null || categoryFilter === ""
            ? products
            : products.filter((p) => (p.category ?? "") === categoryFilter);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                        <div className="aspect-square animate-pulse bg-muted" />
                        <div className="space-y-2 p-3">
                            <div className="h-4 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (visible.length === 0) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                {t("profile.noProducts")}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => (
                <div
                    key={p.id}
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                >
                    <Link
                        to={`/products/${p.id}`}
                        className="relative aspect-square overflow-hidden bg-muted"
                    >
                        {p.imageUrl ? (
                            <img
                                src={p.imageUrl}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                {p.name}
                            </div>
                        )}
                        <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-primary shadow-sm backdrop-blur-sm">
                            <ShoppingCart className="h-5 w-5" />
                        </span>
                    </Link>
                    <div className="p-3">
                        <Link
                            to={`/products/${p.id}`}
                            className="line-clamp-1 font-medium text-foreground hover:text-primary"
                        >
                            {p.name}
                        </Link>
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-lg font-bold text-primary">
                                {formatCurrencyVnd(p.price)}
                            </span>
                            {p.soldCount != null ? (
                                <span className="text-xs text-muted-foreground">
                                    {t("profile.soldCount", { count: p.soldCount })}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
