import { useMemo, useState } from "react";
import { Star, ShoppingCart, Mail, CheckCircle2, Plus, Minus, Store } from "lucide-react";
import { Button } from "../../../shared/ui";
import type { ProductDetail } from "../types/product.types";
import { Link } from "react-router-dom";
import { useAuthSession } from "../../../shared/auth/useAuthSession";

interface ProductDetailPanelProps {
    product: ProductDetail;
    onAddToCart?: (quantity: number, variantId?: string) => void | Promise<void>;
    onBuyNow?: (quantity: number, variantId?: string) => void | Promise<void>;
}

export function ProductDetailPanel({
    product,
    onAddToCart,
    onBuyNow,
}: ProductDetailPanelProps) {
    const { user } = useAuthSession();
    const variants = product.variants ?? [];
    const needsVariant = variants.length > 0;
    const [selectedId, setSelectedId] = useState<string | null>(
        variants[0]?.id ?? null,
    );
    const [quantity, setQuantity] = useState(1);

    const isOwnProduct = user?.id === product.seller?.id;

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

    const discountPercent = product.oldPrice 
        ? Math.round(((product.oldPrice - displayPrice) / product.oldPrice) * 100)
        : null;

    const handleQuantityChange = (val: number) => {
        if (val < 1) return;
        setQuantity(val);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    New Arrival
                </div>
                <h1 className="text-4xl font-black tracking-tight leading-tight text-foreground">
                    {product.name}
                </h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                                key={s}
                                className={`h-5 w-5 ${s <= (product.rating?.average ?? 0) ? "fill-current" : ""}`}
                            />
                        ))}
                        <span className="ml-2 text-sm font-bold text-foreground">
                            {product.rating?.average?.toFixed(1) ?? "0.0"}
                        </span>
                    </div>
                    <span className="text-muted-foreground/30">|</span>
                    <span className="text-sm font-medium text-muted-foreground underline decoration-muted-foreground/30">
                        {product.rating?.total ?? 0} Reviews
                    </span>
                    <span className="text-muted-foreground/30">|</span>
                    <span className="text-sm font-medium text-muted-foreground">
                        {product.salesCount ?? 0} Sold
                    </span>
                </div>
            </div>

            <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-primary">
                    ${displayPrice.toFixed(2)}
                </span>
                {product.oldPrice ? (
                    <>
                        <span className="text-xl text-muted-foreground line-through">
                            ${product.oldPrice.toFixed(2)}
                        </span>
                        {discountPercent && (
                            <span className="text-sm font-bold bg-primary/20 text-primary px-2 py-1 rounded">
                                -{discountPercent}% OFF
                            </span>
                        )}
                    </>
                ) : null}
            </div>

            <div className="space-y-6">
                {/* Variant Selection */}
                {variants.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold uppercase tracking-wide">
                                Options: <span className="text-muted-foreground">{selected?.name ?? "Select"}</span>
                            </p>
                            <button className="text-xs font-bold text-primary hover:underline">
                                Size Guide
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    disabled={variant.stockQuantity <= 0}
                                    onClick={() => setSelectedId(variant.id)}
                                    className={`py-3 rounded-lg border text-sm font-bold transition-all ${
                                        selectedId === variant.id
                                            ? "border-2 border-primary bg-primary/5 text-primary"
                                            : "border-border hover:border-primary"
                                    } ${variant.stockQuantity <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                                >
                                    {variant.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quantity Picker */}
                <div className="space-y-3">
                    <p className="text-sm font-bold uppercase tracking-wide">Quantity</p>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 items-center rounded-xl border border-border bg-card p-1">
                            <button 
                                onClick={() => handleQuantityChange(quantity - 1)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-bold text-foreground">{quantity}</span>
                            <button 
                                onClick={() => handleQuantityChange(quantity + 1)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                            {selected && selected.stockQuantity > 0 ? `${selected.stockQuantity} items left` : ""}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                {!isOwnProduct ? (
                    <div className="flex flex-col gap-3">
                        <Button
                            size="lg"
                            className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            disabled={!canPurchase}
                            onClick={() => void onAddToCart?.(quantity, needsVariant ? selectedId ?? undefined : undefined)}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            Add to Cart
                        </Button>
                        <Button
                            size="lg"
                            className="w-full h-14 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-all"
                            disabled={!canPurchase}
                            onClick={() => void onBuyNow?.(quantity, needsVariant ? selectedId ?? undefined : undefined)}
                        >
                            Buy It Now
                        </Button>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 text-center">
                        <p className="text-sm font-bold text-primary">You are viewing your own product</p>
                    </div>
                )}

                {/* Seller Profile Card */}
                {product.seller && (
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <img
                                    className="w-14 h-14 rounded-full object-cover ring-2 ring-background shadow-md"
                                    src={product.seller.avatarUrl || "https://via.placeholder.com/150"}
                                    alt={product.seller.name}
                                />
                                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1 rounded-full border-2 border-background shadow-sm">
                                    <CheckCircle2 className="h-3 w-3 fill-current" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg text-foreground">
                                    {product.seller.name}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center text-amber-500">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span className="ml-1 font-bold text-foreground">
                                            {(product.seller.shopRating ?? 0).toFixed(1)}
                                        </span>
                                    </div>
                                    <span>•</span>
                                    <span className="font-medium">{product.seller.followersCount ?? 0} Followers</span>
                                </div>
                            </div>
                            {isOwnProduct ? (
                                <Link 
                                    to={`/seller/dashboard`}
                                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors flex items-center gap-2"
                                >
                                    <Store className="h-4 w-4" />
                                    View Shop
                                </Link>
                            ) : (
                                <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-muted transition-colors">
                                    Follow
                                </button>
                            )}
                        </div>
                        {!isOwnProduct && (
                            <button className="w-full py-2 bg-card border border-border rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:border-primary transition-colors">
                                <Mail className="h-4 w-4" />
                                Message Seller
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
