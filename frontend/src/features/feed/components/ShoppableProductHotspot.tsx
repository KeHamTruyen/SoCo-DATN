import { ShoppingCart, Tag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { ShoppableProduct } from "../types/feed.types";
import { formatCurrencyVnd } from "../../../shared/lib/formatCurrencyVnd";

interface ShoppableProductHotspotProps {
    product: ShoppableProduct;
}

export function ShoppableProductHotspot({ product }: ShoppableProductHotspotProps) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="product-hotspot absolute"
            style={{ left: `${product.positionX}%`, top: `${product.positionY}%` }}
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-white transition-transform hover:scale-110"
            >
                <Tag className="h-3.5 w-3.5 text-primary" />
            </button>
            {open && (
                <div className="absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                        {product.imageUrl && (
                            <img
                                src={product.imageUrl}
                                alt={product.productName}
                                className="h-12 w-12 rounded-lg object-cover"
                            />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{product.productName}</p>
                            <p className="text-sm font-bold text-primary">{formatCurrencyVnd(product.price)}</p>
                        </div>
                    </div>
                    <Link
                        to={`/products/${product.productId}`}
                        className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-700"
                    >
                        <ShoppingCart className="h-3 w-3" />
                        View Product
                    </Link>
                </div>
            )}
        </div>
    );
}
