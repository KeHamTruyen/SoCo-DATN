import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cartApi } from "../features/cart/api/cartApi";
import { productApi } from "../features/product/api/productApi";
import { ProductDetailPanel } from "../features/product/components/ProductDetailPanel";
import { ProductGallery } from "../features/product/components/ProductGallery";
import type { ProductDetail as ProductDetailType } from "../features/product/types/product.types";
import { Button, UnifiedHeader } from "../shared/ui";

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cartMsg, setCartMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await productApi.getProductDetail(id);
                if (!mounted) return;
                setProduct(data);
            } catch {
                if (!mounted) return;
                setError("Unable to load product detail.");
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    async function handleAddToCart(variantId?: string) {
        if (!product) return;
        if (product.variants?.length && !variantId) return;
        setCartMsg(null);
        try {
            await cartApi.addItem(product.id, 1, variantId);
            setCartMsg("Added to cart.");
        } catch {
            setCartMsg("Could not add to cart. Sign in and try again.");
        }
    }

    function handleBuyNow(variantId?: string) {
        void (async () => {
            await handleAddToCart(variantId);
            navigate("/cart");
        })();
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/marketplace"
            />
            <main className="mx-auto w-full max-w-[1200px] flex-1 space-y-4 px-4 py-6">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    Back
                </Button>
                {isLoading ? (
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                        Loading product...
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                ) : product ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <ProductGallery images={product.images} />
                        <div className="space-y-2">
                            {cartMsg ? (
                                <p className="text-sm text-muted-foreground">
                                    {cartMsg}
                                </p>
                            ) : null}
                            <ProductDetailPanel
                                product={product}
                                onAddToCart={handleAddToCart}
                                onBuyNow={handleBuyNow}
                            />
                        </div>
                    </div>
                ) : null}
            </main>
        </div>
    );
}

