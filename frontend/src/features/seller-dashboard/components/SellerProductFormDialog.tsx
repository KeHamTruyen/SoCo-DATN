import { useEffect, useState } from "react";
import { sellerDashboardApi } from "../api/sellerDashboardApi";
import { uploadApi } from "../../upload/api/uploadApi";
import type {
    SellerCategoryOption,
    SellerProductDetail,
    SellerProductImageRow,
} from "../types/sellerDashboard.types";
import { HttpError } from "../../../shared/api/httpClient";
import { cn } from "../../../shared/lib/cn";

export type SellerProductFormMode = "create" | "edit";

interface SellerProductFormDialogProps {
    open: boolean;
    mode: SellerProductFormMode;
    productId: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

const emptyForm = () => ({
    title: "",
    description: "",
    price: "",
    compareAtPrice: "",
    categoryId: "",
    stockQuantity: "0",
    lowStockThreshold: "10",
    sku: "",
});

export function SellerProductFormDialog({
    open,
    mode,
    productId,
    onClose,
    onSuccess,
}: SellerProductFormDialogProps) {
    const [categories, setCategories] = useState<SellerCategoryOption[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [existingImages, setExistingImages] = useState<SellerProductImageRow[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(new Set());
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        void (async () => {
            try {
                const c = await sellerDashboardApi.listCategories();
                setCategories(c);
            } catch {
                setCategories([]);
            }
        })();
    }, [open]);

    useEffect(() => {
        if (!open) {
            setForm(emptyForm());
            setExistingImages([]);
            setRemovedImageIds(new Set());
            setPendingFiles([]);
            setError(null);
            setLoading(false);
            return;
        }
        if (mode === "create") {
            setForm(emptyForm());
            setExistingImages([]);
            setRemovedImageIds(new Set());
            setPendingFiles([]);
            setError(null);
            return;
        }
        if (mode === "edit" && productId) {
            setError(null);
            setLoading(true);
            void (async () => {
                try {
                    const p: SellerProductDetail = await sellerDashboardApi.getMyProduct(
                        productId,
                    );
                    setForm({
                        title: p.title,
                        description: p.description ?? "",
                        price: String(p.price),
                        compareAtPrice:
                            p.compareAtPrice != null ? String(p.compareAtPrice) : "",
                        categoryId: p.categoryId ?? "",
                        stockQuantity: String(p.stockQuantity),
                        lowStockThreshold: String(p.lowStockThreshold),
                        sku: p.sku ?? "",
                    });
                    setExistingImages(p.images);
                    setRemovedImageIds(new Set());
                    setPendingFiles([]);
                } catch (e) {
                    setError(
                        e instanceof HttpError
                            ? e.message
                            : "Không tải được sản phẩm.",
                    );
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [open, mode, productId]);

    if (!open) return null;

    function parsePrice(s: string): number | undefined {
        const t = s.trim();
        if (t === "") return undefined;
        const n = Number.parseFloat(t.replace(",", "."));
        return Number.isFinite(n) && n >= 0 ? n : undefined;
    }

    function parseIntSafe(s: string, fallback: number): number {
        const n = Number.parseInt(s, 10);
        return Number.isNaN(n) || n < 0 ? fallback : n;
    }

    async function handleSubmit() {
        setError(null);
        const title = form.title.trim();
        const price = parsePrice(form.price);
        if (!title) {
            setError("Vui lòng nhập tên sản phẩm.");
            return;
        }
        if (price === undefined) {
            setError("Giá không hợp lệ.");
            return;
        }

        const description = form.description.trim();
        const compareRaw = parsePrice(form.compareAtPrice);
        const categoryIdTrim = form.categoryId.trim();
        const stockQuantity = parseIntSafe(form.stockQuantity, 0);
        const lowStockThreshold = parseIntSafe(form.lowStockThreshold, 10);
        const sku = form.sku.trim() || undefined;

        setSaving(true);
        try {
            if (mode === "create") {
                let imagePayload: { url: string; altText?: string }[] | undefined;
                if (pendingFiles.length > 0) {
                    const uploaded = await uploadApi.uploadProductImages(pendingFiles);
                    imagePayload = uploaded.map((u, i) => ({
                        url: u.url,
                        altText: title.slice(0, 80) + (uploaded.length > 1 ? ` ${i + 1}` : ""),
                    }));
                }
                await sellerDashboardApi.createProduct({
                    title,
                    description: description || undefined,
                    price,
                    compareAtPrice: compareRaw,
                    categoryId: categoryIdTrim || undefined,
                    stockQuantity,
                    lowStockThreshold,
                    sku,
                    images: imagePayload,
                });
            } else if (productId) {
                await sellerDashboardApi.updateProduct(productId, {
                    title,
                    description: description || undefined,
                    price,
                    compareAtPrice: compareRaw ?? null,
                    categoryId: categoryIdTrim ? categoryIdTrim : null,
                    stockQuantity,
                    lowStockThreshold,
                    sku: sku ?? null,
                });

                for (const imageId of removedImageIds) {
                    await sellerDashboardApi.deleteProductImage(productId, imageId);
                }

                if (pendingFiles.length > 0) {
                    const uploaded = await uploadApi.uploadProductImages(pendingFiles);
                    await sellerDashboardApi.addProductImages(
                        productId,
                        uploaded.map((u, i) => ({
                            url: u.url,
                            altText: title.slice(0, 80) + ` ${i + 1}`,
                        })),
                    );
                }
            }
            onSuccess();
            onClose();
        } catch (e) {
            const msg =
                e instanceof HttpError
                    ? e.message
                    : "Không lưu được. Thử lại sau.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    }

    const visibleExisting = existingImages.filter((im) => !removedImageIds.has(im.id));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="presentation"
        >
            <button
                type="button"
                className="absolute inset-0 bg-black/50"
                aria-label="Đóng"
                onClick={() => {
                    if (!saving) onClose();
                }}
            />
            <div
                role="dialog"
                aria-modal="true"
                className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl"
            >
                <h2 className="text-lg font-bold">
                    {mode === "create" ? "Thêm sản phẩm" : "Sửa sản phẩm"}
                </h2>

                {loading ? (
                    <div className="mt-6 space-y-3">
                        <div className="h-10 animate-pulse rounded-lg bg-muted" />
                        <div className="h-24 animate-pulse rounded-lg bg-muted" />
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        <label className="block text-sm font-medium">
                            Tên sản phẩm *
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, title: e.target.value }))
                                }
                                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                disabled={saving}
                            />
                        </label>
                        <label className="block text-sm font-medium">
                            Mô tả
                            <textarea
                                value={form.description}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, description: e.target.value }))
                                }
                                rows={4}
                                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                disabled={saving}
                            />
                        </label>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-medium">
                                Giá (đ) *
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={form.price}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, price: e.target.value }))
                                    }
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    disabled={saving}
                                />
                            </label>
                            <label className="block text-sm font-medium">
                                Giá so sánh (đ)
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={form.compareAtPrice}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            compareAtPrice: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    disabled={saving}
                                />
                            </label>
                        </div>
                        <label className="block text-sm font-medium">
                            Danh mục
                            <select
                                value={form.categoryId}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, categoryId: e.target.value }))
                                }
                                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                disabled={saving}
                            >
                                <option value="">— Không chọn —</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-medium">
                                Tồn kho
                                <input
                                    type="number"
                                    min={0}
                                    value={form.stockQuantity}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            stockQuantity: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    disabled={saving}
                                />
                            </label>
                            <label className="block text-sm font-medium">
                                Ngưỡng cảnh báo tồn
                                <input
                                    type="number"
                                    min={0}
                                    value={form.lowStockThreshold}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            lowStockThreshold: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    disabled={saving}
                                />
                            </label>
                        </div>
                        <label className="block text-sm font-medium">
                            SKU
                            <input
                                type="text"
                                value={form.sku}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, sku: e.target.value }))
                                }
                                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                disabled={saving}
                            />
                        </label>

                        <div>
                            <p className="text-sm font-medium">Ảnh sản phẩm</p>
                            {mode === "edit" && visibleExisting.length > 0 ? (
                                <ul className="mt-2 flex flex-wrap gap-2">
                                    {visibleExisting.map((im) => (
                                        <li
                                            key={im.id}
                                            className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted"
                                        >
                                            <img
                                                src={im.imageUrl}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                title="Gỡ ảnh"
                                                className="absolute right-0 top-0 rounded-bl bg-destructive px-1 text-xs text-destructive-foreground"
                                                disabled={saving}
                                                onClick={() =>
                                                    setRemovedImageIds((prev) => {
                                                        const n = new Set(prev);
                                                        n.add(im.id);
                                                        return n;
                                                    })
                                                }
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="mt-2 block w-full text-sm text-muted-foreground file:mr-2 file:rounded-lg file:border file:border-border file:bg-muted file:px-3 file:py-1.5"
                                disabled={saving}
                                onChange={(e) => {
                                    const files = e.target.files
                                        ? Array.from(e.target.files)
                                        : [];
                                    setPendingFiles(files);
                                    e.target.value = "";
                                }}
                            />
                            {pendingFiles.length > 0 ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Đã chọn {pendingFiles.length} ảnh mới để tải lên khi lưu.
                                </p>
                            ) : null}
                        </div>
                    </div>
                )}

                {error ? (
                    <p className="mt-3 text-sm text-destructive">{error}</p>
                ) : null}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className={cn(
                            "rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50",
                        )}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        disabled={saving || loading}
                        onClick={() => void handleSubmit()}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                        {saving ? "Đang lưu…" : "Lưu"}
                    </button>
                </div>
            </div>
        </div>
    );
}
