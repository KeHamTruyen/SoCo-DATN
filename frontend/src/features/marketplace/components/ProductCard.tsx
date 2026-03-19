import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProductListItem } from "../types/marketplace.types";

interface ProductCardProps {
    product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Link
            to={`/products/${product.id}`}
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
            <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <img
                    src={
                        product.imageUrl ??
                        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=600&fit=crop"
                    }
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="p-2">
                <p className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {product.name}
                </p>
                <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">
                        ${product.price.toFixed(2)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <Star className="h-3.5 w-3.5 fill-current text-primary-400" />
                        {product.rating?.toFixed(1) ?? "0.0"}
                    </span>
                </div>
            </div>
        </Link>
    );
}
