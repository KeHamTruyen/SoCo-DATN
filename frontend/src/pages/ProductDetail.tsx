import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { cartApi } from "../features/cart/api/cartApi";
import { profileApi } from "../features/profile/api/profileApi";
import { productApi } from "../features/product/api/productApi";
import { ProductDetailPanel } from "../features/product/components/ProductDetailPanel";
import { ProductGallery } from "../features/product/components/ProductGallery";
import type {
    ProductDetail as ProductDetailType,
    ProductReviewItem,
    ProductReviewPhoto,
} from "../features/product/types/product.types";
import { Footer, UnifiedHeader } from "../shared/ui";

type TabType = "reviews" | "details" | "shipping";
const REVIEW_PAGE_SIZE = 3;

function formatReviewDate(date: string): string {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return "";
    return value.toLocaleDateString();
}

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [reviewsTotal, setReviewsTotal] = useState(0);
    const [reviewsError, setReviewsError] = useState<string | null>(null);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState(false);
    const [cartActionError, setCartActionError] = useState<string | null>(null);
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("reviews");

    const reviewPhotos = useMemo<ProductReviewPhoto[]>(() => {
        const map = new Map<string, ProductReviewPhoto>();
        reviews.forEach((review) => {
            review.photos.forEach((photo) => {
                if (!map.has(photo.imageUrl)) {
                    map.set(photo.imageUrl, photo);
                }
            });
        });
        return Array.from(map.values());
    }, [reviews]);

    const reviewDistribution = useMemo(() => {
        const base = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
        reviews.forEach((review) => {
            const rounded = Math.max(1, Math.min(5, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
            base[rounded] += 1;
        });
        return base;
    }, [reviews]);

    const canLoadMoreReviews = reviews.length < reviewsTotal;

    useEffect(() => {
        if (!id) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setError(null);
            setReviews([]);
            setReviewsPage(1);
            setReviewsTotal(0);
            setReviewsError(null);
            setIsLoadingReviews(true);
            try {
                const [productData, reviewData] = await Promise.all([
                    productApi.getProductDetail(id),
                    productApi.getProductReviews(id, { page: 1, limit: REVIEW_PAGE_SIZE }),
                ]);
                if (!mounted) return;
                setProduct(productData);
                if (productData.seller?.id) {
                    try {
                        const sellerProfile = await profileApi.getProfile(productData.seller.id);
                        setProduct((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      seller: prev.seller
                                          ? {
                                                ...prev.seller,
                                                followersCount: sellerProfile.followersCount ?? 0,
                                                shopRating: sellerProfile.shopRating ?? 0,
                                            }
                                          : prev.seller,
                                  }
                                : prev,
                        );
                    } catch {
                        // Keep product details usable if seller profile lookup fails.
                    }
                }
                setReviews(reviewData.items);
                setReviewsTotal(reviewData.total);
                setReviewsPage(reviewData.page);
            } catch {
                if (!mounted) return;
                setError("Unable to load product detail.");
                setReviewsError("Unable to load reviews.");
            } finally {
                if (mounted) setIsLoading(false);
                if (mounted) setIsLoadingReviews(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    async function handleLoadMoreReviews() {
        if (!id || isLoadingMoreReviews || !canLoadMoreReviews) return;
        const nextPage = reviewsPage + 1;
        setIsLoadingMoreReviews(true);
        setReviewsError(null);
        try {
            const data = await productApi.getProductReviews(id, { page: nextPage, limit: REVIEW_PAGE_SIZE });
            setReviews((prev) => [...prev, ...data.items]);
            setReviewsPage(data.page);
            setReviewsTotal(data.total);
        } catch {
            setReviewsError("Unable to load more reviews.");
        } finally {
            setIsLoadingMoreReviews(false);
        }
    }

    function openPhotoModal(startIndex = 0) {
        if (reviewPhotos.length === 0) return;
        const safeIndex = Math.max(0, Math.min(reviewPhotos.length - 1, startIndex));
        setActivePhotoIndex(safeIndex);
        setIsPhotoModalOpen(true);
    }

    function showPrevPhoto() {
        setActivePhotoIndex((prev) => (prev - 1 + reviewPhotos.length) % reviewPhotos.length);
    }

    function showNextPhoto() {
        setActivePhotoIndex((prev) => (prev + 1) % reviewPhotos.length);
    }

    const photoModal =
        isPhotoModalOpen && reviewPhotos.length > 0
            ? createPortal(
                  <div
                      role="presentation"
                      className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm"
                      onClick={() => setIsPhotoModalOpen(false)}
                  >
                      <div
                          role="dialog"
                          aria-modal="true"
                          className="relative mx-auto mt-12 flex h-[calc(100%-6rem)] w-[min(calc(100%-2rem),72rem)] items-center justify-center rounded-2xl bg-card p-4"
                          onClick={(event) => event.stopPropagation()}
                      >
                          <button
                              type="button"
                              className="absolute right-4 top-4 rounded-full bg-background/80 p-2 text-foreground"
                              onClick={() => setIsPhotoModalOpen(false)}
                          >
                              <X className="h-5 w-5" />
                          </button>
                          <button
                              type="button"
                              onClick={showPrevPhoto}
                              className="absolute left-4 rounded-full bg-background/80 p-2 text-foreground"
                          >
                              <ChevronLeft className="h-6 w-6" />
                          </button>
                          <img
                              src={reviewPhotos[activePhotoIndex]?.imageUrl}
                              alt="Review photo"
                              className="h-full max-h-full w-auto max-w-full rounded-lg object-contain"
                          />
                          <button
                              type="button"
                              onClick={showNextPhoto}
                              className="absolute right-4 rounded-full bg-background/80 p-2 text-foreground"
                          >
                              <ChevronRight className="h-6 w-6" />
                          </button>
                          <p className="absolute bottom-4 rounded bg-background/80 px-3 py-1 text-xs text-foreground">
                              {activePhotoIndex + 1} / {reviewPhotos.length}
                          </p>
                      </div>
                  </div>,
                  document.body,
              )
            : null;

    async function addToCartWithStatus(quantity: number, variantId?: string): Promise<boolean> {
        if (!product) return false;
        if (product.variants?.length && !variantId) {
            setCartActionError("Please select a variant before adding to cart.");
            return false;
        }
        try {
            await cartApi.addItem(product.id, quantity, variantId);
            setCartActionError(null);
            return true;
        } catch {
            setCartActionError("Unable to add item to cart. Please try again.");
            return false;
        }
    }

    async function handleAddToCart(quantity: number, variantId?: string) {
        await addToCartWithStatus(quantity, variantId);
    }

    function handleBuyNow(quantity: number, variantId?: string) {
        void (async () => {
            const ok = await addToCartWithStatus(quantity, variantId);
            if (ok) navigate("/cart");
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
                        {cartActionError ? (
                            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                                {cartActionError}
                            </p>
                        ) : null}
                        <ProductDetailPanel
                            product={product}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                        />
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-16 pt-10">
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
                                
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="flex items-center gap-4">
                                            <span className="w-4 text-sm font-medium text-muted-foreground">{star}</span>
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                                <div 
                                                    className="h-full bg-primary" 
                                                    style={{
                                                        width: `${
                                                            reviews.length > 0
                                                                ? Math.round((reviewDistribution[star as 1 | 2 | 3 | 4 | 5] / reviews.length) * 100)
                                                                : 0
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="w-10 text-xs text-muted-foreground/60">
                                                {reviews.length > 0
                                                    ? `${Math.round((reviewDistribution[star as 1 | 2 | 3 | 4 | 5] / reviews.length) * 100)}%`
                                                    : "0%"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews Feed */}
                            <div className="lg:col-span-8">
                                <div className="mb-8 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-foreground">Customer Photos</h3>
                                    <button
                                        type="button"
                                        onClick={() => openPhotoModal(0)}
                                        className="text-sm font-bold text-primary disabled:text-muted-foreground"
                                        disabled={reviewPhotos.length === 0}
                                    >
                                        View all {reviewPhotos.length}
                                    </button>
                                </div>
                                <div className="mb-12 grid grid-cols-4 gap-3 sm:grid-cols-6">
                                    {reviewPhotos.slice(0, 5).map((photo, index) => {
                                        const isOverflowTile = index === 4 && reviewPhotos.length > 5;
                                        if (isOverflowTile) {
                                            return (
                                                <button
                                                    type="button"
                                                    key={`${photo.id}-more`}
                                                    onClick={() => openPhotoModal(index)}
                                                    className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
                                                >
                                                    <img
                                                        src={photo.imageUrl}
                                                        alt="More review photos"
                                                        className="h-full w-full object-cover opacity-50"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                                                        +{reviewPhotos.length - 4}
                                                    </div>
                                                </button>
                                            );
                                        }
                                        return (
                                            <button
                                                type="button"
                                                key={photo.id}
                                                className="aspect-square overflow-hidden rounded-lg bg-muted"
                                                onClick={() => openPhotoModal(index)}
                                            >
                                                <img src={photo.imageUrl} alt="Review" className="h-full w-full object-cover" />
                                            </button>
                                        );
                                    })}
                                    {reviewPhotos.length === 0 && (
                                        <p className="col-span-full text-sm text-muted-foreground">No customer photos yet.</p>
                                    )}
                                </div>

                                <div className="space-y-8">
                                    {isLoadingReviews && (
                                        <p className="text-sm text-muted-foreground">Loading reviews...</p>
                                    )}
                                    {!isLoadingReviews && reviews.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No reviews yet.</p>
                                    )}
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-border pb-8">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                                                        {review.author.avatarUrl ? (
                                                            <img
                                                                src={review.author.avatarUrl}
                                                                alt={review.author.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : null}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">
                                                            {review.author.name}
                                                            {review.isVerifiedBuyer && (
                                                                <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-[10px] font-black uppercase text-green-700">
                                                                    Verified Buyer
                                                                </span>
                                                            )}
                                                        </p>
                                                        <div className="flex items-center text-xs text-amber-500">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star
                                                                    key={s}
                                                                    className={`h-3 w-3 ${s <= Math.round(review.rating) ? "fill-current" : ""}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground/60">
                                                    {formatReviewDate(review.createdAt)}
                                                </span>
                                            </div>
                                            {review.title ? <h5 className="mb-2 font-bold text-foreground">{review.title}</h5> : null}
                                            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{review.content}</p>
                                            {review.helpfulCount > 0 && (
                                                <p className="text-xs font-bold text-muted-foreground">
                                                    Helpful ({review.helpfulCount})
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {reviewsError ? (
                                    <p className="mt-4 text-sm text-destructive">{reviewsError}</p>
                                ) : null}
                                {canLoadMoreReviews && (
                                    <button
                                        type="button"
                                        onClick={handleLoadMoreReviews}
                                        disabled={isLoadingMoreReviews}
                                        className="mt-8 w-full rounded-xl border-2 border-border py-4 font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isLoadingMoreReviews ? "Loading..." : "Load More Reviews"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "details" && (
                        <div className="prose prose-stone max-w-none dark:prose-invert">
                            <h3 className="text-2xl font-bold text-foreground">Product Description</h3>
                            <p className="whitespace-pre-wrap text-muted-foreground">{product.description}</p>
                            <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {product.categoryName ? (
                                    <li className="flex gap-2 text-muted-foreground">
                                        <span className="font-bold text-foreground">Category:</span>
                                        {product.categoryName}
                                    </li>
                                ) : null}
                                {product.sku ? (
                                    <li className="flex gap-2 text-muted-foreground">
                                        <span className="font-bold text-foreground">SKU:</span>
                                        {product.sku}
                                    </li>
                                ) : null}
                                <li className="flex gap-2 text-muted-foreground">
                                    <span className="font-bold text-foreground">Stock:</span>
                                    {product.stockQuantity ?? 0}
                                </li>
                                <li className="flex gap-2 text-muted-foreground">
                                    <span className="font-bold text-foreground">Sold:</span>
                                    {product.salesCount ?? 0}
                                </li>
                                <li className="flex gap-2 text-muted-foreground">
                                    <span className="font-bold text-foreground">Views:</span>
                                    {product.viewsCount ?? 0}
                                </li>
                            </ul>
                        </div>
                    )}

                    {activeTab === "shipping" && (
                        <div className="space-y-6 text-muted-foreground">
                            <h3 className="text-2xl font-bold text-foreground">Shipping & Returns</h3>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-foreground">Shipping Policy</h4>
                                    <p className="text-sm">We offer free standard shipping on all orders over 150.000 ₫. Standard delivery typically takes 3-5 business days.</p>
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

            <Footer />
            {photoModal}
        </div>
    );
}

