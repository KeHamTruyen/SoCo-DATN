import { Bookmark, Package, ShoppingCart, Star } from "lucide-react";
import { type MouseEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cartApi } from "../../cart/api/cartApi";
import { savedItemsApi } from "../../saved-items/api/savedItemsApi";
import type { ProductListItem } from "../types/marketplace.types";
import { cn } from "../../../shared/lib/cn";

interface ProductCardProps {
    product: ProductListItem;
}

function formatSold(n: number | undefined): string {
    if (n == null || Number.isNaN(n)) return "";
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k sold`;
    return `${n} sold`;
}

export function ProductCard({ product }: ProductCardProps) {
    const [cartBusy, setCartBusy] = useState(false);
    const [cartHint, setCartHint] = useState<string | null>(null);
    const [savedId, setSavedId] = useState<string | null>(null);
    const [saveBusy, setSaveBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const id = await savedItemsApi.lookup("PRODUCT", product.id);
                if (!cancelled) setSavedId(id);
            } catch {
                if (!cancelled) setSavedId(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [product.id]);

    const soldLabel = formatSold(product.soldCount);

    const handleAddCart = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setCartBusy(true);
        setCartHint(null);
        try {
            await cartApi.addItem(product.id, 1);
            setCartHint("Added");
            window.setTimeout(() => setCartHint(null), 2000);
        } catch {
            setCartHint("Failed");
            window.setTimeout(() => setCartHint(null), 2500);
        } finally {
            setCartBusy(false);
        }
    };

    const handleToggleSave = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (saveBusy) return;
        setSaveBusy(true);
        try {
            if (savedId) {
                await savedItemsApi.remove(savedId);
                setSavedId(null);
            } else {
                const row = await savedItemsApi.save("PRODUCT", product.id);
                setSavedId(row.id);
            }
        } catch {
            /* ignore */
        } finally {
            setSaveBusy(false);
        }
    };

    return (
        <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="relative aspect-4/5 overflow-hidden">
                <Link to={`/products/${product.id}`} className="block h-full w-full">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                            <Package className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
                        </div>
                    )}
                </Link>
                <button
                    type="button"
                    disabled={saveBusy}
                    onClick={handleToggleSave}
                    className={cn(
                        "absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 backdrop-blur-md transition-colors dark:bg-neutral-900/80",
                        savedId ? "text-primary" : "text-neutral-400 hover:text-primary",
                    )}
                    aria-label={savedId ? "Remove from saved" : "Save to wishlist"}
                    aria-pressed={!!savedId}
                >
                    <Bookmark className={cn("h-5 w-5", savedId && "fill-current")} />
                </button>
            </div>
            <div className="flex flex-1 flex-col p-4">
                <Link to={`/products/${product.id}`}>
                    <h4 className="line-clamp-2 font-bold text-neutral-900 transition-colors group-hover:text-primary dark:text-white dark:group-hover:text-primary-400">
                        {product.name}
                    </h4>
                </Link>
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                    <span className="font-bold">{product.rating?.toFixed(1) ?? "—"}</span>
                    {soldLabel ? (
                        <span className="ml-1 font-normal text-neutral-400 dark:text-neutral-500">
                            ({soldLabel})
                        </span>
                    ) : null}
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-xl font-black text-neutral-900 dark:text-white">
                        ${product.price.toFixed(2)}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                        <button
                            type="button"
                            disabled={cartBusy}
                            onClick={handleAddCart}
                            className="rounded-xl bg-primary/10 p-2 text-primary transition-all hover:bg-primary hover:text-white disabled:opacity-50"
                            aria-label="Add to cart"
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                        {cartHint ? (
                            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                {cartHint}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
