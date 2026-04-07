import { useEffect, useMemo, useState } from "react";
import { cartApi } from "../../cart/api/cartApi";
import { profileApi } from "../../profile/api/profileApi";
import { productApi } from "../api/productApi";
import type {
    ProductDetail,
    ProductReviewItem,
    ProductReviewPhoto,
} from "../types/product.types";

const REVIEW_PAGE_SIZE = 3;

export type ProductDetailTab = "reviews" | "details" | "shipping";

export function useProductDetailPage(productId?: string) {
    const [product, setProduct] = useState<ProductDetail | null>(null);
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
    const [activeTab, setActiveTab] = useState<ProductDetailTab>("reviews");

    const reviewPhotos = useMemo<ProductReviewPhoto[]>(() => {
        const map = new Map<string, ProductReviewPhoto>();
        reviews.forEach((review) => {
            review.photos.forEach((photo) => {
                if (!map.has(photo.imageUrl)) map.set(photo.imageUrl, photo);
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
        if (!productId) return;
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
                    productApi.getProductDetail(productId),
                    productApi.getProductReviews(productId, { page: 1, limit: REVIEW_PAGE_SIZE }),
                ]);
                if (!mounted) return;
                setProduct(productData);
                if (productData.seller?.id) {
                    try {
                        const sellerProfile = await profileApi.getProfile(productData.seller.id);
                        if (!mounted) return;
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
                        // Keep page usable if profile enrichment fails.
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
                if (mounted) {
                    setIsLoading(false);
                    setIsLoadingReviews(false);
                }
            }
        })();
        return () => {
            mounted = false;
        };
    }, [productId]);

    const loadMoreReviews = async () => {
        if (!productId || isLoadingMoreReviews || !canLoadMoreReviews) return;
        const nextPage = reviewsPage + 1;
        setIsLoadingMoreReviews(true);
        setReviewsError(null);
        try {
            const data = await productApi.getProductReviews(productId, {
                page: nextPage,
                limit: REVIEW_PAGE_SIZE,
            });
            setReviews((prev) => [...prev, ...data.items]);
            setReviewsPage(data.page);
            setReviewsTotal(data.total);
        } catch {
            setReviewsError("Unable to load more reviews.");
        } finally {
            setIsLoadingMoreReviews(false);
        }
    };

    const openPhotoModal = (startIndex = 0) => {
        if (reviewPhotos.length === 0) return;
        const safeIndex = Math.max(0, Math.min(reviewPhotos.length - 1, startIndex));
        setActivePhotoIndex(safeIndex);
        setIsPhotoModalOpen(true);
    };

    const closePhotoModal = () => setIsPhotoModalOpen(false);

    const showPrevPhoto = () => {
        setActivePhotoIndex((prev) => (prev - 1 + reviewPhotos.length) % reviewPhotos.length);
    };

    const showNextPhoto = () => {
        setActivePhotoIndex((prev) => (prev + 1) % reviewPhotos.length);
    };

    const addToCartWithStatus = async (quantity: number, variantId?: string): Promise<boolean> => {
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
    };

    return {
        product,
        reviews,
        reviewsError,
        isLoadingReviews,
        isLoadingMoreReviews,
        cartActionError,
        activePhotoIndex,
        isPhotoModalOpen,
        isLoading,
        error,
        activeTab,
        reviewPhotos,
        reviewDistribution,
        canLoadMoreReviews,
        setActiveTab,
        loadMoreReviews,
        openPhotoModal,
        closePhotoModal,
        showPrevPhoto,
        showNextPhoto,
        addToCartWithStatus,
    };
}
