import { Star } from "lucide-react";
import { Button } from "../../../shared/ui";
import type { ProductDetail } from "../types/product.types";

interface ProductDetailPanelProps {
    product: ProductDetail;
}

export function ProductDetailPanel({ product }: ProductDetailPanelProps) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <Star className="h-4 w-4 fill-current text-primary-400" />
                {product.rating?.average?.toFixed(1) ?? "0.0"} (
                {product.rating?.total ?? 0} reviews)
            </div>
            <div className="mt-4 flex items-end gap-3">
                <span className="text-3xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                </span>
                {product.oldPrice ? (
                    <span className="text-sm text-neutral-400 line-through">
                        ${product.oldPrice.toFixed(2)}
                    </span>
                ) : null}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {product.description}
            </p>

            {product.variants && product.variants.length > 0 ? (
                <div className="mt-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Variants
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant) => (
                            <span
                                key={variant.id}
                                className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800"
                            >
                                {variant.name}: {variant.value}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            <div className="mt-6 space-y-2">
                <Button size="lg" className="w-full">
                    Add to cart
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                    Buy now
                </Button>
            </div>
        </div>
    );
}
