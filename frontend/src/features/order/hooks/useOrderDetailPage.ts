import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { reviewApi } from "../../review/api/reviewApi";
import { uploadProductImages } from "../../upload/api/uploadApi";
import { orderApi } from "../api/orderApi";
import type { OrderReviewFormItem } from "../components/OrderReviewModal";
import { queryKeys } from "../../../shared/query/queryKeys";

export function useOrderDetailPage(orderId?: string) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewNotice, setReviewNotice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const orderKey = orderId ? queryKeys.order.detail(orderId) : ["order", "detail", "empty"];

    const orderQuery = useQuery({
        queryKey: orderKey,
        enabled: Boolean(orderId),
        queryFn: () => orderApi.getOrder(orderId!),
    });

    const cancelOrderMutation = useMutation({
        mutationFn: (id: string) => orderApi.cancelOrder(id),
    });

    const updateStatusMutation = useMutation({
        mutationFn: (id: string) => orderApi.updateOrderStatus(id, "completed"),
        onSuccess(updated) {
            queryClient.setQueryData(orderKey, updated);
        },
    });

    const submitReviewsMutation = useMutation({
        mutationFn: async (reviewItems: OrderReviewFormItem[]) => {
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
            return result;
        },
    });

    const order = orderQuery.data ?? null;

    const cancelOrder = async () => {
        if (!order) return;
        try {
            await cancelOrderMutation.mutateAsync(order.id);
            navigate("/orders");
        } finally {
        }
    };

    const markAsReceived = async () => {
        if (!order) return;
        try {
            await updateStatusMutation.mutateAsync(order.id);
        } catch {
            setError(t("orderDetail.errors.updateStatusFailed", "Unable to update order status."));
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
        setReviewNotice(null);
        const result = await submitReviewsMutation.mutateAsync(reviewItems);
        const failed = result.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
        if (failed.length === 0) {
            setReviewNotice(t("orderDetail.review.submitSuccess", "Review submitted successfully."));
            setIsReviewModalOpen(false);
            await queryClient.invalidateQueries({ queryKey: orderKey });
            return;
        }
        const firstReason = failed[0]?.reason;
        setReviewNotice(
            firstReason instanceof Error
                ? firstReason.message
                : t("orderDetail.review.errors.submitFailed", "Failed to submit review."),
        );
    };

    return {
        order,
        isLoading: orderQuery.isLoading,
        isUpdating: cancelOrderMutation.isPending || updateStatusMutation.isPending,
        isReviewModalOpen,
        isSubmittingReview: submitReviewsMutation.isPending,
        reviewNotice,
        error:
            error ??
            (orderQuery.isError
                ? t("orderDetail.errors.loadFailed", "Unable to load order details.")
                : null),
        setIsReviewModalOpen,
        setReviewNotice,
        cancelOrder,
        markAsReceived,
        submitReviews,
    };
}
