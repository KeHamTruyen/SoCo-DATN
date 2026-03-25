import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "../../../shared/ui";
import type { ProductDetail } from "../types/product.types";

interface ProductDetailPanelProps {
    product: ProductDetail;
    onAddToCart?: (variantId?: string) => void | Promise<void>;
    onBuyNow?: (variantId?: string) => void | Promise<void>;
}

export function ProductDetailPanel({
    product,
    onAddToCart,
    onBuyNow,
}: ProductDetailPanelProps) {
    const variants = product.variants ?? [];
    const needsVariant = variants.length > 0;
    const [selectedId, setSelectedId] = useState<string | null>(
        variants[0]?.id ?? null,
    );

    const selected = useMemo(
        () => variants.find((v) => v.id === selectedId),
        [variants, selectedId],
    );

    const displayPrice =
        selected && selected.price != null ? selected.price : product.price;
    const canPurchase =
        !needsVariant ||
        (selectedId != null &&
            (!selected || selected.stockQuantity > 0));

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
                    ${displayPrice.toFixed(2)}
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

            {variants.length > 0 ? (
                <div className="mt-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Options
                    </p>
                    <div className="flex flex-col gap-2">
                        {variants.map((variant) => (
                            <label
                                key={variant.id}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
                            >
                                <input
                                    type="radio"
                                    name="variant"
                                    checked={selectedId === variant.id}
                                    onChange={() => setSelectedId(variant.id)}
                                />
                                <span className="flex-1">
                                    <span className="font-medium">
                                        {variant.name}
                                    </span>
                                    {variant.value !== variant.name ? (
                                        <span className="text-neutral-500">
                                            {" "}
                                            — {variant.value}
                                        </span>
                                    ) : null}
                                </span>
                                {variant.price != null ? (
                                    <span className="font-semibold text-primary">
                                        ${variant.price.toFixed(2)}
                                    </span>
                                ) : null}
                                {variant.stockQuantity <= 0 ? (
                                    <span className="text-xs text-destructive">
                                        Out of stock
                                    </span>
                                ) : null}
                            </label>
                        ))}
                    </div>
                </div>
            ) : null}

            <div className="mt-6 space-y-2">
                <Button
                    size="lg"
                    className="w-full"
                    disabled={!canPurchase}
                    onClick={() => void onAddToCart?.(needsVariant ? selectedId ?? undefined : undefined)}
                >
                    Add to cart
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    disabled={!canPurchase}
                    onClick={() => void onBuyNow?.(needsVariant ? selectedId ?? undefined : undefined)}
                >
                    Buy now
                </Button>
            </div>
        </div>
    );
}
