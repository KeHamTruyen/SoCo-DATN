import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { reviewApi } from "../../review/api/reviewApi";
import { uploadProductImages } from "../../upload/api/uploadApi";
import { orderApi } from "../api/orderApi";
import type { Order } from "../types/order.types";
import type { OrderReviewFormItem } from "../components/OrderReviewModal";

export function useOrderDetailPage(orderId?: string) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewNotice, setReviewNotice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await orderApi.getOrder(orderId);
                if (!mounted) return;
                setOrder(data);
            } catch {
                if (!mounted) return;
                setError(t("orderDetail.errors.loadFailed", "Unable to load order details."));
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [orderId, t]);

    const cancelOrder = async () => {
        if (!order) return;
        setIsUpdating(true);
        try {
            await orderApi.cancelOrder(order.id);
            navigate("/orders");
        } finally {
            setIsUpdating(false);
        }
    };

    const markAsReceived = async () => {
        if (!order) return;
        setIsUpdating(true);
        try {
            const updated = await orderApi.updateOrderStatus(order.id, "completed");
            setOrder(updated);
        } catch {
            setError(t("orderDetail.errors.updateStatusFailed", "Unable to update order status."));
        } finally {
            setIsUpdating(false);
        }
    };

    const submitReviews = async (reviewItems: OrderReviewFormItem[]) => {
        if (!order) return;
        if (reviewItems.length === 0) {
            setReviewNotice(
                t("orderDetail.review.alreadyReviewed", "This item has already been reviewed."),
            );
            setIsReviewModalOpen(false);
            return;
        }
        setIsSubmittingReview(true);
        setReviewNotice(null);
        const result = await Promise.allSettled(
            reviewItems.map(async (item) => {
                const uploaded = item.files.length > 0 ? await uploadProductImages(item.files) : [];
                return reviewApi.createReview({
                    orderItemId: item.orderItemId,
                    rating: item.rating,
                    content: item.content.trim() || undefined,
                    images: uploaded.map((u) => u.url),
                });
            }),
        );
        const failed = result.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
        if (failed.length === 0) {
            setReviewNotice(t("orderDetail.review.submitSuccess", "Review submitted successfully."));
            setIsReviewModalOpen(false);
            setOrder(await orderApi.getOrder(order.id));
            setIsSubmittingReview(false);
            return;
        }
        const firstReason = failed[0]?.reason;
        setReviewNotice(
            firstReason instanceof Error
                ? firstReason.message
                : t("orderDetail.review.errors.submitFailed", "Failed to submit review."),
        );
        setIsSubmittingReview(false);
    };

    return {
        order,
        isLoading,
        isUpdating,
        isReviewModalOpen,
        isSubmittingReview,
        reviewNotice,
        error,
        setIsReviewModalOpen,
        setReviewNotice,
        cancelOrder,
        markAsReceived,
        submitReviews,
    };
}
