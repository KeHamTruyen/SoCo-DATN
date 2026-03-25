import { useEffect, useState } from "react";
import type { SellerProductRow } from "../types/sellerDashboard.types";
import { cn } from "../../../shared/lib/cn";

interface SellerStockAdjustDialogProps {
    product: SellerProductRow | null;
    open: boolean;
    saving: boolean;
    error: string | null;
    onClose: () => void;
    onSave: (stockQuantity: number, lowStockThreshold: number) => void;
}

export function SellerStockAdjustDialog({
    product,
    open,
    saving,
    error,
    onClose,
    onSave,
}: SellerStockAdjustDialogProps) {
    const [value, setValue] = useState("");
    const [threshold, setThreshold] = useState("");

    useEffect(() => {
        if (product && open) {
            setValue(String(product.stockQuantity));
            setThreshold(String(product.lowStockThreshold));
        }
    }, [product, open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="presentation"
        >
            <button
                type="button"
                className="absolute inset-0 bg-black/50"
                aria-label="Đóng"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="stock-dialog-title"
                className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
            >
                <h2
                    id="stock-dialog-title"
                    className="text-lg font-bold text-neutral-900 dark:text-neutral-100"
                >
                    Cập nhật tồn kho
                </h2>
                {product ? (
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        {product.title}
                    </p>
                ) : null}

                <label className="mt-4 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Số lượng tồn
                    <input
                        type="number"
                        min={0}
                        step={1}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                    />
                </label>

                <label className="mt-4 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Ngưỡng cảnh báo tồn thấp
                    <input
                        type="number"
                        min={0}
                        step={1}
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                    />
                </label>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                    Cảnh báo khi tồn kho nhỏ hơn hoặc bằng ngưỡng này.
                </p>

                {error ? (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                ) : null}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                            const n = Number.parseInt(value, 10);
                            const t = Number.parseInt(threshold, 10);
                            if (Number.isNaN(n) || n < 0) return;
                            if (Number.isNaN(t) || t < 0) return;
                            onSave(n, t);
                        }}
                        className={cn(
                            "rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50",
                        )}
                    >
                        {saving ? "Đang lưu…" : "Lưu"}
                    </button>
                </div>
            </div>
        </div>
    );
}
