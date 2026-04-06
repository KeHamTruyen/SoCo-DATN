import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, Star, ThumbsUp, MessageSquare } from "lucide-react";
import { cartApi } from "../features/cart/api/cartApi";
import { productApi } from "../features/product/api/productApi";
import { ProductDetailPanel } from "../features/product/components/ProductDetailPanel";
import { ProductGallery } from "../features/product/components/ProductGallery";
import type { ProductDetail as ProductDetailType } from "../features/product/types/product.types";
import { UnifiedHeader } from "../shared/ui";

type TabType = "reviews" | "details" | "shipping";

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("reviews");

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

    async function handleAddToCart(quantity: number, variantId?: string) {
        if (!product) return;
        if (product.variants?.length && !variantId) return;
        try {
            await cartApi.addItem(product.id, quantity, variantId);
        } catch {
            // Error handling can be added here (e.g., toast)
        }
    }

    function handleBuyNow(quantity: number, variantId?: string) {
        void (async () => {
            await handleAddToCart(quantity, variantId);
            navigate("/cart");
        })();
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <UnifiedHeader activePath="/marketplace" />
                <main className="flex flex-1 items-center justify-center">
                    <div className="animate-pulse text-lg font-medium text-muted-foreground">Loading product details...</div>
                </main>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex min-h-screen flex-col">
                <UnifiedHeader activePath="/marketplace" />
                <main className="flex flex-1 items-center justify-center px-4">
                    <div className="max-w-md text-center">
                        <h2 className="mb-2 text-2xl font-bold text-foreground">Oops!</h2>
                        <p className="mb-6 text-muted-foreground">{error || "Product not found."}</p>
                        <Link to="/marketplace" className="text-primary font-bold hover:underline">Back to Marketplace</Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/marketplace"
            />
            
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link className="hover:text-primary transition-colors" to="/">Home</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link className="hover:text-primary transition-colors" to="/marketplace">Marketplace</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="font-medium text-foreground">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Left: Image Gallery */}
                    <div className="lg:col-span-7">
                        <ProductGallery images={product.images} />
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:col-span-5">
                        <ProductDetailPanel
                            product={product}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                        />
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-16 border-t border-border pt-10">
                    <div className="mb-10 flex border-b border-border">
                        {(["reviews", "details", "shipping"] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-4 text-sm font-bold transition-all -mb-px ${
                                    activeTab === tab
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {tab === "reviews" ? "Ratings & Reviews" : tab === "details" ? "Product Details" : "Shipping & Returns"}
                            </button>
                        ))}
                    </div>

                    {activeTab === "reviews" && (
                        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
                            {/* Summary */}
                            <div className="space-y-8 lg:col-span-4">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-foreground">Customer Summary</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-6xl font-black text-foreground">
                                            {product.rating?.average?.toFixed(1) ?? "0.0"}
                                        </span>
                                        <div className="space-y-1">
                                            <div className="flex items-center text-amber-500">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star 
                                                        key={s}
                                                        className={`h-5 w-5 ${s <= (product.rating?.average ?? 0) ? "fill-current" : ""}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Based on {product.rating?.total ?? 0} reviews</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* star bars dummy */}
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="flex items-center gap-4">
                                            <span className="w-4 text-sm font-medium text-muted-foreground">{star}</span>
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                                <div 
                                                    className="h-full bg-primary" 
                                                    style={{ width: `${star === 5 ? 70 : star === 4 ? 15 : 5}%` }}
                                                ></div>
                                            </div>
                                            <span className="w-10 text-xs text-muted-foreground/60">{star === 5 ? "70%" : star === 4 ? "15%" : "5%"}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border p-6 text-center">
                                    <p className="font-bold text-foreground">Have you bought this item?</p>
                                    <p className="text-sm text-muted-foreground">Share your thoughts with other customers!</p>
                                    <button className="rounded-lg bg-primary/10 px-6 py-2 font-bold text-primary transition-colors hover:bg-primary/20">
                                        Write a Review
                                    </button>
                                </div>
                            </div>

                            {/* Reviews Feed */}
                            <div className="lg:col-span-8">
                                <div className="mb-8 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-foreground">Customer Photos</h3>
                                    <button className="text-sm font-bold text-primary">View all 42</button>
                                </div>
                                <div className="mb-12 grid grid-cols-4 gap-3 sm:grid-cols-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="aspect-square overflow-hidden rounded-lg bg-muted">
                                            <img src={`https://picsum.photos/seed/${i + 100}/200/200`} alt="Review" className="h-full w-full object-cover" />
                                        </div>
                                    ))}
                                    <div className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg bg-muted">
                                        <img src="https://picsum.photos/seed/more/200/200" alt="More" className="h-full w-full object-cover opacity-50 transition-opacity group-hover:opacity-40" />
                                        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">+38</div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Mock Review */}
                                    <div className="border-b border-border pb-8">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                                                    <img src="https://i.pravatar.cc/100?u=alex" alt="User" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">
                                                        Alex Thompson 
                                                        <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-[10px] font-black uppercase text-green-700">Verified Buyer</span>
                                                    </p>
                                                    <div className="flex items-center text-xs text-amber-500">
                                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3 w-3 fill-current" />)}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground/60">2 days ago</span>
                                        </div>
                                        <h5 className="mb-2 font-bold text-foreground">Incredible quality and fit!</h5>
                                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                                            I've been looking for a jacket like this for months. The material is thick and clearly high-quality, and the waterproofing is legit.
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-1 text-xs font-bold text-muted-foreground transition-colors hover:text-primary">
                                                <ThumbsUp className="h-3 w-3" /> Helpful (12)
                                            </button>
                                            <button className="flex items-center gap-1 text-xs font-bold text-muted-foreground transition-colors hover:text-primary">
                                                <MessageSquare className="h-3 w-3" /> Reply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button className="mt-8 w-full rounded-xl border-2 border-border py-4 font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                    Load More Reviews
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "details" && (
                        <div className="prose prose-stone max-w-none dark:prose-invert">
                            <h3 className="text-2xl font-bold text-foreground">Product Description</h3>
                            <p className="whitespace-pre-wrap text-muted-foreground">{product.description}</p>
                            <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                <li className="flex gap-2 text-muted-foreground"><span className="font-bold text-foreground">Material:</span> Premium Performance Fabric</li>
                                <li className="flex gap-2 text-muted-foreground"><span className="font-bold text-foreground">Fit:</span> Modern Athletic</li>
                                <li className="flex gap-2 text-muted-foreground"><span className="font-bold text-foreground">Tech:</span> Water Repellent, Breathable</li>
                                <li className="flex gap-2 text-muted-foreground"><span className="font-bold text-foreground">Origin:</span> Responsibly Sourced</li>
                            </ul>
                        </div>
                    )}

                    {activeTab === "shipping" && (
                        <div className="space-y-6 text-muted-foreground">
                            <h3 className="text-2xl font-bold text-foreground">Shipping & Returns</h3>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-foreground">Shipping Policy</h4>
                                    <p className="text-sm">We offer free standard shipping on all orders over $150. Standard delivery typically takes 3-5 business days.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-foreground">Returns & Exchanges</h4>
                                    <p className="text-sm">Items can be returned within 30 days of receipt. Products must be in original condition with tags attached.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="mt-20 border-t border-border bg-card py-12">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <p className="text-muted-foreground text-sm">© 2024 SocialCommerce. Elevating the social shopping experience.</p>
                </div>
            </footer>
        </div>
    );
}

