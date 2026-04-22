import { useMemo, useState } from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { cartApi } from "../../cart/api/cartApi";
import { marketplaceApi } from "../../marketplace/api/marketplaceApi";
import { profileApi } from "../../profile/api/profileApi";
import { productApi } from "../api/productApi";
import type {
    ProductDetail,
    ProductReviewFilters,
    ProductReviewItem,
    ProductReviewPhoto,
} from "../types/product.types";
import { queryKeys } from "../../../shared/query/queryKeys";

const REVIEW_PAGE_SIZE = 3;

export type ProductDetailTab = "reviews" | "details" | "shipping";

interface UseProductDetailPageOptions {
    productId?: string;
    isAuthenticated?: boolean;
    onAuthRequired?: () => void;
}

export function useProductDetailPage(options?: UseProductDetailPageOptions | string) {
    const normalizedOptions =
        typeof options === "string" ? { productId: options } : (options ?? {});
    const {
        productId,
        isAuthenticated = true,
        onAuthRequired = () => {},
    } = normalizedOptions;
    const queryClient = useQueryClient();
    const [reviewFilters, setReviewFilters] = useState<ProductReviewFilters>({
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    const [cartActionError, setCartActionError] = useState<string | null>(null);
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ProductDetailTab>("reviews");
    const reviewFilterSignature = useMemo(
        () => JSON.stringify(reviewFilters),
        [reviewFilters],
    );

    const productQuery = useQuery({
        queryKey: productId ? queryKeys.product.detail(productId) : ["product", "detail", "empty"],
        enabled: Boolean(productId),
        queryFn: async () => {
            const detail = await productApi.getProductDetail(productId!);
            const lastViewedKey = "marketplace-last-viewed-product-id";
            const sessionKey = "marketplace-session-id";
            const sessionId =
                window.sessionStorage.getItem(sessionKey) ??
                `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            window.sessionStorage.setItem(sessionKey, sessionId);
            const previousProductId = window.sessionStorage.getItem(lastViewedKey) ?? undefined;
            window.sessionStorage.setItem(lastViewedKey, detail.id);
            void marketplaceApi
                .trackProductView(detail.id, { sessionId, previousProductId })
                .catch(() => {});

            if (!detail.seller?.id) {
                return detail;
            }
            try {
                const sellerProfile = await profileApi.getProfile(detail.seller.id);
                return {
                    ...detail,
                    seller: detail.seller
                        ? {
                              ...detail.seller,
                              followersCount: sellerProfile.followersCount ?? 0,
                              shopRating: sellerProfile.shopRating ?? 0,
                          }
                        : detail.seller,
                };
            } catch {
                return detail;
            }
        },
    });

    const reviewsQuery = useInfiniteQuery({
        queryKey: productId
            ? queryKeys.product.reviews(productId, reviewFilterSignature)
            : ["product", "reviews", "empty"],
        enabled: Boolean(productId),
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            productApi.getProductReviews(productId!, {
                page: pageParam,
                limit: REVIEW_PAGE_SIZE,
                ...reviewFilters,
            }),
        getNextPageParam(lastPage) {
            const loaded = lastPage.page * REVIEW_PAGE_SIZE;
            return loaded < lastPage.total ? lastPage.page + 1 : undefined;
        },
    });

    const addToCartMutation = useMutation({
        mutationFn: ({ quantity, variantId }: { quantity: number; variantId?: string }) => {
            const activeProduct = productQuery.data;
            if (!activeProduct) {
                throw new Error("Product not available");
            }
            return cartApi.addItem(activeProduct.id, quantity, variantId);
        },
    });

    const product = productQuery.data ?? null;
    const reviewPages = reviewsQuery.data?.pages ?? [];
    const reviews = reviewPages.flatMap((page) => page.items);
    const reviewsTotal = reviewPages[0]?.total ?? 0;
    const reviewDistribution = reviewPages[0]?.ratingDistribution ?? {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    };

    const reviewPhotos = useMemo<ProductReviewPhoto[]>(() => {
        const map = new Map<string, ProductReviewPhoto>();
        reviews.forEach((review) => {
            review.photos.forEach((photo) => {
                if (!map.has(photo.imageUrl)) map.set(photo.imageUrl, photo);
            });
        });
        return Array.from(map.values());
    }, [reviews]);

    const canLoadMoreReviews = reviews.length < reviewsTotal;

    const loadMoreReviews = async () => {
        if (reviewsQuery.hasNextPage && !reviewsQuery.isFetchingNextPage) {
            await reviewsQuery.fetchNextPage();
        }
    };

    const applyReviewFilters = (nextFilters: ProductReviewFilters) => {
        setReviewFilters((prev) => ({
            ...prev,
            ...nextFilters,
        }));
    };

    const openPhotoModal = (startIndex = 0) => {
        if (reviewPhotos.length === 0) return;
        const safeIndex = Math.max(
            0,
            Math.min(reviewPhotos.length - 1, startIndex),
        );
        setActivePhotoIndex(safeIndex);
        setIsPhotoModalOpen(true);
    };

    const closePhotoModal = () => setIsPhotoModalOpen(false);

    const showPrevPhoto = () => {
        setActivePhotoIndex(
            (prev) => (prev - 1 + reviewPhotos.length) % reviewPhotos.length,
        );
    };

    const showNextPhoto = () => {
        setActivePhotoIndex((prev) => (prev + 1) % reviewPhotos.length);
    };

    const addToCartWithStatus = async (
        quantity: number,
        variantId?: string,
    ): Promise<boolean> => {
        if (!isAuthenticated) {
            onAuthRequired();
            return false;
        }
        const activeProduct = productQuery.data;
        if (!activeProduct) return false;
        if (activeProduct.variants?.length && !variantId) {
            setCartActionError(
                "Please select a variant before adding to cart.",
            );
            return false;
        }
        try {
            await addToCartMutation.mutateAsync({ quantity, variantId });
            setCartActionError(null);
            void queryClient.invalidateQueries({
                queryKey: productId ? queryKeys.product.detail(productId) : undefined,
            });
            return true;
        } catch {
            setCartActionError("Unable to add item to cart. Please try again.");
            return false;
        }
    };

    return {
        product,
        reviews,
        reviewsError: reviewsQuery.isError ? "Unable to load reviews." : null,
        isLoadingReviews: reviewsQuery.isLoading,
        isLoadingMoreReviews: reviewsQuery.isFetchingNextPage,
        cartActionError,
        activePhotoIndex,
        isPhotoModalOpen,
        isLoading: productQuery.isLoading,
        error: productQuery.isError ? "Unable to load product detail." : null,
        activeTab,
        reviewPhotos,
        reviewDistribution,
        reviewFilters,
        canLoadMoreReviews,
        setActiveTab,
        applyReviewFilters,
        loadMoreReviews,
        openPhotoModal,
        closePhotoModal,
        showPrevPhoto,
        showNextPhoto,
        addToCartWithStatus,
    };
}
