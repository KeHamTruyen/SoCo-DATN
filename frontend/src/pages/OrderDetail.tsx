import {
    CheckCircle2,
    Download,
    MapPin,
    MessageCircle,
    Package,
    ShoppingBag,
    Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { orderApi } from "../features/order/api/orderApi";
import OrderReviewModal, {
    type OrderReviewFormItem,
} from "../features/order/components/OrderReviewModal";
import type { Order, OrderStatus } from "../features/order/types/order.types";
import { reviewApi } from "../features/review/api/reviewApi";
import { uploadProductImages } from "../features/upload/api/uploadApi";
import { cn } from "../shared/lib/cn";
import { formatCurrencyVnd } from "../shared/lib/formatCurrencyVnd";
import { Button, UnifiedHeader } from "../shared/ui";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { key: "pending", label: "Order Placed", icon: <ShoppingBag className="h-5 w-5" /> },
    { key: "confirmed", label: "Confirmed", icon: <Package className="h-5 w-5" /> },
    { key: "processing", label: "Processing", icon: <Package className="h-5 w-5" /> },
    { key: "shipping", label: "In Transit", icon: <Truck className="h-5 w-5" /> },
    { key: "delivered", label: "Delivered", icon: <CheckCircle2 className="h-5 w-5" /> },
    { key: "completed", label: "Completed", icon: <CheckCircle2 className="h-5 w-5" /> },
];

export default function OrderDetail() {
    const { t, i18n } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewNotice, setReviewNotice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await orderApi.getOrder(id);
                if (!mounted) return;
                setOrder(data);
            } catch {
                if (!mounted) return;
                setError(t("orderDetail.errors.loadFailed", "Unable to load order details."));
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id, t]);

    const currentStepIndex = order
        ? STATUS_STEPS.findIndex((s) => s.key === order.status)
        : -1;

    const handleSubmitReviews = async (reviewItems: OrderReviewFormItem[]) => {
        if (!order) return;
        if (reviewItems.length === 0) {
            setReviewNotice(t("orderDetail.review.alreadyReviewed", "This item has already been reviewed."));
            setIsReviewModalOpen(false);
            return;
        }
        setIsSubmittingReview(true);
        setReviewNotice(null);
        const result = await Promise.allSettled(
            reviewItems.map(async (item) => {
                const uploaded = item.files.length > 0
                    ? await uploadProductImages(item.files)
                    : [];
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
            setIsSubmittingReview(false);
            return;
        }
        const firstReason = failed[0]?.reason;
        const message =
            firstReason instanceof Error
                ? firstReason.message
                : t("orderDetail.review.errors.submitFailed", "Failed to submit review.");
        setReviewNotice(message);
        setIsSubmittingReview(false);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: t("messaging.navFeed", "Feed"), to: "/feed" },
                    { label: t("messaging.navMarketplace", "Marketplace"), to: "/marketplace" },
                ]}
            />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="h-12 w-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                        <div className="h-48 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                ) : error || !order ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                        {error ?? t("orderDetail.errors.notFound", "Order not found.")}
                    </div>
                ) : (
                    <>
                        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <nav className="mb-2 flex gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    <Link to="/marketplace" className="hover:text-primary">
                                        {t("navigation.marketplace", "Marketplace")}
                                    </Link>
                                    <span>/</span>
                                    <Link to="/orders" className="hover:text-primary">
                                        {t("profile.orders", "Orders")}
                                    </Link>
                                </nav>
                                <h1 className="text-3xl font-extrabold tracking-tight">
                                    {t("orderDetail.title", "Order #{{orderNumber}}", { orderNumber: order.orderNumber })}
                                </h1>
                                <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                                    {t("orderDetail.placedOn", "Placed on {{date}}", {
                                        date: new Date(order.createdAt).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        }),
                                    })}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    {t("orderDetail.actions.invoice", "Invoice")}
                                </Button>
                                <Button className="gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    {t("orderDetail.actions.messageSeller", "Message Seller")}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="space-y-8 lg:col-span-2">
                                {order.status !== "cancelled" && order.status !== "refunded" ? (
                                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                        <h3 className="mb-8 text-lg font-bold">{t("orderDetail.sections.status", "Order Status")}</h3>
                                        <div className="relative flex items-center justify-between">
                                            <div className="absolute left-0 top-1/2 z-0 h-1 w-full -translate-y-1/2 bg-neutral-100 dark:bg-neutral-800">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{
                                                        width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            {STATUS_STEPS.map((step, idx) => {
                                                const done = idx <= currentStepIndex;
                                                const active = idx === currentStepIndex;
                                                return (
                                                    <div
                                                        key={step.key}
                                                        className="relative z-10 flex flex-col items-center gap-2"
                                                    >
                                                        <div
                                                            className={cn(
                                                                "flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white dark:ring-neutral-900",
                                                                done
                                                                    ? active
                                                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                                        : "bg-primary text-white"
                                                                    : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800",
                                                            )}
                                                        >
                                                            {step.icon}
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                "text-xs font-medium",
                                                                active
                                                                    ? "font-bold text-primary"
                                                                    : done
                                                                        ? "font-bold text-neutral-900 dark:text-white"
                                                                        : "text-neutral-400",
                                                            )}
                                                        >
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ) : (
                                    <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-900/20">
                                        <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">
                                            {t("orderDetail.statusNotice", "This order has been {{status}}.", { status: order.status })}
                                        </p>
                                    </section>
                                )}

                                <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                    <div className="border-b border-neutral-100 p-6 dark:border-neutral-800">
                                        <h3 className="text-lg font-bold">
                                            {t("orderDetail.sections.items", "Items in Order ({{count}})", { count: order.items.length })}
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex flex-col gap-6 p-6 sm:flex-row">
                                                <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 sm:w-24">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.productName}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="text-lg font-bold">{item.productName}</h4>
                                                            {item.variantText && (
                                                                <p className="mt-1 text-sm text-neutral-500">
                                                                    {item.variantText}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="font-bold">
                                                            {formatCurrencyVnd(item.price)}
                                                        </p>
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <span className="text-sm text-neutral-500">
                                                            {t("orderDetail.qty", "Qty: {{qty}}", { qty: item.quantity })}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                className="text-sm font-semibold text-primary hover:underline"
                                                            >
                                                                {t("orderDetail.actions.buyAgain", "Buy Again")}
                                                            </button>
                                                            {order.status === "completed" && (
                                                                <>
                                                                    <span className="text-neutral-300">|</span>
                                                                    <button
                                                                        type="button"
                                                                        className="text-sm font-semibold text-primary hover:underline"
                                                                        onClick={() => {
                                                                            setReviewNotice(null);
                                                                            setIsReviewModalOpen(true);
                                                                        }}
                                                                    >
                                                                        {item.review?.id
                                                                            ? t("orderDetail.actions.viewReview", "View Review")
                                                                            : t("orderDetail.actions.leaveReview", "Leave Review")}
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {order.timeline && order.timeline.length > 0 && (
                                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                        <h3 className="mb-6 text-lg font-bold">{t("orderDetail.sections.timeline", "Tracking Timeline")}</h3>
                                        <div className="space-y-6">
                                            {order.timeline.map((entry, idx) => (
                                                <div key={idx} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="mt-1.5 h-3 w-3 rounded-full bg-primary" />
                                                        {idx < order.timeline!.length - 1 && (
                                                            <div className="mt-1 w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-700" />
                                                        )}
                                                    </div>
                                                    <div className="pb-6">
                                                        <p className="font-semibold capitalize">
                                                            {entry.status.replace(/_/g, " ")}
                                                        </p>
                                                        {entry.note && (
                                                            <p className="text-sm text-neutral-500">{entry.note}</p>
                                                        )}
                                                        <p className="mt-1 text-xs text-neutral-400">
                                                            {new Date(entry.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                    <h3 className="mb-4 text-lg font-bold">{t("orderDetail.sections.summary", "Order Summary")}</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">{t("orderDetail.summary.subtotal", "Subtotal")}</span>
                                            <span>{formatCurrencyVnd(order.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">{t("orderDetail.summary.shipping", "Shipping")}</span>
                                            {order.shipping === 0 ? (
                                                <span className="text-success">{t("orderDetail.summary.free", "Free")}</span>
                                            ) : (
                                                <span>{formatCurrencyVnd(order.shipping)}</span>
                                            )}
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500">{t("orderDetail.summary.discount", "Discount")}</span>
                                                <span className="text-success">-{formatCurrencyVnd(order.discount)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
                                            <div className="flex justify-between font-bold">
                                                <span>{t("orderDetail.summary.total", "Total")}</span>
                                                <span className="text-xl text-primary">
                                                    {formatCurrencyVnd(order.total)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        {t("orderDetail.sections.shippingAddress", "Shipping Address")}
                                    </h3>
                                    <p className="font-semibold">{order.shippingAddress.fullName}</p>
                                    <p className="mt-1 text-sm text-neutral-500">{order.shippingAddress.phone}</p>
                                    <p className="mt-1 text-sm text-neutral-500">{order.shippingAddress.address}</p>
                                </div>

                                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                    <h3 className="mb-4 text-lg font-bold">{t("orderDetail.sections.payment", "Payment")}</h3>
                                    <p className="text-sm font-medium">
                                        {order.paymentMethod === "cod"
                                            ? t("orderDetail.payment.cod", "Cash on Delivery")
                                            : order.paymentMethod === "bank_transfer"
                                              ? t("orderDetail.payment.bankTransfer", "Bank Transfer")
                                              : order.paymentMethod === "e_wallet"
                                                ? t("orderDetail.payment.eWallet", "E-Wallet")
                                                : order.paymentMethod}
                                    </p>
                                </div>

                                {order.status === "completed" && (
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => {
                                            setReviewNotice(null);
                                            setIsReviewModalOpen(true);
                                        }}
                                    >
                                        {order.items.some((item) => !item.review?.id)
                                            ? t("orderDetail.review.reviewOrder", "Review Order")
                                            : t("orderDetail.review.viewReviewed", "View Reviewed Items")}
                                    </Button>
                                )}

                                {order.status === "pending" && (
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        disabled={isUpdating}
                                        onClick={() => {
                                            setIsUpdating(true);
                                            void orderApi.cancelOrder(order.id).then(() => {
                                                navigate("/orders");
                                            }).finally(() => setIsUpdating(false));
                                        }}
                                    >
                                        {t("orderDetail.actions.cancelOrder", "Cancel Order")}
                                    </Button>
                                )}
                                {order.status === "delivered" && (
                                    <Button
                                        className="w-full"
                                        disabled={isUpdating}
                                        onClick={() => {
                                            setIsUpdating(true);
                                            void orderApi.updateOrderStatus(order.id, "completed")
                                                .then((updated) => setOrder(updated))
                                                .catch(() =>
                                                    setError(t("orderDetail.errors.updateStatusFailed", "Unable to update order status.")),
                                                )
                                                .finally(() => setIsUpdating(false));
                                        }}
                                    >
                                        {t("orderDetail.actions.markAsReceived", "Mark as Received")}
                                    </Button>
                                )}

                                {reviewNotice && (
                                    <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                                        {reviewNotice}
                                    </p>
                                )}
                            </div>
                        </div>
                        <OrderReviewModal
                            open={isReviewModalOpen}
                            isSubmitting={isSubmittingReview}
                            items={order.items.map((item) => ({
                                id: item.id,
                                productName: item.productName,
                                imageUrl: item.imageUrl,
                                review: item.review,
                            }))}
                            onClose={() => {
                                if (isSubmittingReview) return;
                                setIsReviewModalOpen(false);
                            }}
                            onSubmit={handleSubmitReviews}
                        />
                    </>
                )}
            </main>
        </div>
    );
}
