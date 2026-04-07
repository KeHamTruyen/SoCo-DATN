import { Star, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../shared/lib/cn";
import { Button } from "../../../shared/ui";

export type OrderReviewModalItem = {
    id: string;
    productName: string;
    imageUrl?: string;
    review?: {
        id: string;
        rating: number;
        content?: string;
        images?: string[];
    };
};

export type OrderReviewFormItem = {
    orderItemId: string;
    rating: number;
    content: string;
    files: File[];
};

interface OrderReviewModalProps {
    open: boolean;
    items: OrderReviewModalItem[];
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (items: OrderReviewFormItem[]) => void | Promise<void>;
}

type DraftMap = Record<string, OrderReviewFormItem>;

const MAX_FILES = 6;

function ratingText(t: (key: string, fallback: string) => string, rating: number) {
    if (rating <= 1) return t("orderDetail.review.rating.1", "Very Bad");
    if (rating === 2) return t("orderDetail.review.rating.2", "Bad");
    if (rating === 3) return t("orderDetail.review.rating.3", "Normal");
    if (rating === 4) return t("orderDetail.review.rating.4", "Satisfied");
    if (rating >= 5) return t("orderDetail.review.rating.5", "Excellent");
    return "";
}

export default function OrderReviewModal({
    open,
    items,
    isSubmitting = false,
    onClose,
    onSubmit,
}: OrderReviewModalProps) {
    const { t } = useTranslation();
    const [drafts, setDrafts] = useState<DraftMap>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        const next: DraftMap = {};
        for (const item of items) {
            next[item.id] = {
                orderItemId: item.id,
                rating: 0,
                content: "",
                files: [],
            };
        }
        setDrafts(next);
        setError(null);
    }, [items, open]);

    const draftList = useMemo(() => items.map((item) => drafts[item.id]).filter(Boolean), [drafts, items]);
    const itemsNeedSubmit = items.filter((item) => !item.review?.id);
    const canSubmit =
        itemsNeedSubmit.length > 0 &&
        itemsNeedSubmit.every((item) => {
            const draft = drafts[item.id];
            return !!draft && draft.rating >= 1 && draft.rating <= 5;
        });

    if (!open) return null;

    const updateDraft = (orderItemId: string, updater: (prev: OrderReviewFormItem) => OrderReviewFormItem) => {
        setDrafts((prev) => {
            const current = prev[orderItemId];
            if (!current) return prev;
            return { ...prev, [orderItemId]: updater(current) };
        });
    };

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                    <h2 className="text-xl font-bold">
                        {t("orderDetail.review.title", "Review Products")}
                    </h2>
                    <button
                        type="button"
                        className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label={t("orderDetail.review.close", "Close")}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[calc(90vh-148px)] space-y-4 overflow-y-auto p-6">
                    {items.map((item) => {
                        const draft = drafts[item.id];
                        if (!draft) return null;
                        const previews = draft.files.map((file) => URL.createObjectURL(file));
                        const isReviewed = Boolean(item.review?.id);
                        return (
                            <section
                                key={item.id}
                                className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="h-14 w-14 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : null}
                                    </div>
                                    <p className="line-clamp-2 font-semibold">{item.productName}</p>
                                </div>

                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                                        {t("orderDetail.review.productQuality", "Product quality")}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }, (_, index) => {
                                            const value = index + 1;
                                            const active = value <= draft.rating;
                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() =>
                                                        updateDraft(item.id, (prev) => ({
                                                            ...prev,
                                                            rating: value,
                                                        }))
                                                    }
                                                    className="p-0.5"
                                                    disabled={isSubmitting || isReviewed}
                                                >
                                                    <Star
                                                        className={cn(
                                                            "h-5 w-5",
                                                            active
                                                                ? "fill-orange-500 text-orange-500"
                                                                : "text-neutral-300 dark:text-neutral-600",
                                                        )}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {draft.rating > 0 && (
                                        <span className="text-sm font-medium text-orange-500">
                                            {ratingText(t, draft.rating)}
                                        </span>
                                    )}
                                </div>

                                <textarea
                                    value={draft.content}
                                    onChange={(event) =>
                                        updateDraft(item.id, (prev) => ({
                                            ...prev,
                                            content: event.target.value,
                                        }))
                                    }
                                    rows={4}
                                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none ring-primary/20 focus:ring dark:border-neutral-700 dark:bg-neutral-950"
                                    placeholder={t(
                                        "orderDetail.review.contentPlaceholder",
                                        "Share your experience about this product...",
                                    )}
                                    disabled={isSubmitting}
                                    readOnly={isReviewed}
                                />

                                {!isReviewed && (
                                    <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-3 py-3 text-sm font-medium text-neutral-600 hover:border-primary hover:text-primary dark:border-neutral-700 dark:text-neutral-300">
                                        <Upload className="h-4 w-4" />
                                        {t("orderDetail.review.addMedia", "Add Images/Video")}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            disabled={isSubmitting}
                                            onChange={(event) => {
                                                const selected = Array.from(event.target.files ?? []);
                                                updateDraft(item.id, (prev) => ({
                                                    ...prev,
                                                    files: [...prev.files, ...selected].slice(0, MAX_FILES),
                                                }));
                                                event.currentTarget.value = "";
                                            }}
                                        />
                                    </label>
                                )}

                                {draft.files.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {draft.files.map((file, index) => (
                                            <div
                                                key={`${file.name}-${index}`}
                                                className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700"
                                            >
                                                <img
                                                    src={previews[index]}
                                                    alt={file.name}
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-0 top-0 rounded-bl bg-black/60 p-0.5 text-white"
                                                    onClick={() =>
                                                        updateDraft(item.id, (prev) => ({
                                                            ...prev,
                                                            files: prev.files.filter((_, i) => i !== index),
                                                        }))
                                                    }
                                                    disabled={isSubmitting || isReviewed}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isReviewed && (
                                    <>
                                        {Array.isArray(item.review?.images) && item.review.images.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {item.review.images.map((url, index) => (
                                                    <div
                                                        key={`${url}-${index}`}
                                                        className="h-16 w-16 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700"
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`review-${index}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <p className="mt-3 text-xs font-medium text-neutral-500">
                                            {t("orderDetail.review.alreadyReviewed", "This item has already been reviewed.")}
                                        </p>
                                    </>
                                )}
                            </section>
                        );
                    })}

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        {t("orderDetail.review.cancel", "Cancel")}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            if (!canSubmit) {
                                setError(
                                    t(
                                        "orderDetail.review.errors.ratingRequired",
                                        "Please rate all products before submitting.",
                                    ),
                                );
                                return;
                            }
                            setError(null);
                            const submitDrafts = draftList.filter((d) => {
                                const currentItem = items.find((i) => i.id === d.orderItemId);
                                return currentItem && !currentItem.review?.id;
                            });
                            void onSubmit(submitDrafts);
                        }}
                        disabled={isSubmitting || !canSubmit}
                    >
                        {isSubmitting
                            ? t("orderDetail.review.submitting", "Submitting...")
                            : t("orderDetail.review.submit", "Submit Review")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
