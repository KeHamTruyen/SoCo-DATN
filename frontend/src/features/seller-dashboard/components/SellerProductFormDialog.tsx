import { useEffect, useState } from "react";
import { sellerDashboardApi } from "../api/sellerDashboardApi";
import { uploadApi } from "../../upload/api/uploadApi";
import type {
    SellerCategoryOption,
    SellerProductDetail,
    SellerProductDimensions,
    SellerProductImageRow,
    SellerProductVariantRow,
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

const PRODUCT_STATUS_OPTIONS = [
    { value: "DRAFT", label: "Nháp" },
    { value: "ACTIVE", label: "Đang bán" },
    { value: "OUT_OF_STOCK", label: "Hết hàng" },
    { value: "ARCHIVED", label: "Lưu trữ" },
] as const;

function parseOptionalNonNegNumber(s: string): number | undefined {
    const t = s.trim();
    if (t === "") return undefined;
    const n = Number.parseFloat(t.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function parseOptionalFieldNumber(
    s: string,
): { ok: true; value: number | null } | { ok: false } {
    const t = s.trim();
    if (t === "") return { ok: true, value: null };
    const n = Number.parseFloat(t.replace(",", "."));
    if (!Number.isFinite(n) || n < 0) return { ok: false };
    return { ok: true, value: n };
}

function buildDimensions(
    lengthStr: string,
    widthStr: string,
    heightStr: string,
): SellerProductDimensions | null {
    const length = parseOptionalNonNegNumber(lengthStr);
    const width = parseOptionalNonNegNumber(widthStr);
    const height = parseOptionalNonNegNumber(heightStr);
    if (length === undefined && width === undefined && height === undefined) return null;
    const o: SellerProductDimensions = { unit: "cm" };
    if (length !== undefined) o.length = length;
    if (width !== undefined) o.width = width;
    if (height !== undefined) o.height = height;
    return o;
}

function dimensionInputsValid(lengthStr: string, widthStr: string, heightStr: string): boolean {
    for (const s of [lengthStr, widthStr, heightStr]) {
        const t = s.trim();
        if (t === "") continue;
        if (parseOptionalNonNegNumber(s) === undefined) return false;
    }
    return true;
}

function parseCommaKeywords(s: string): string[] {
    return s
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 50);
}

function parseOptionsJson(s: string): Record<string, string> {
    const t = s.trim();
    if (!t) return {};
    try {
        const o = JSON.parse(t) as unknown;
        if (typeof o === "object" && o !== null && !Array.isArray(o)) {
            return Object.fromEntries(
                Object.entries(o as Record<string, unknown>).map(([k, v]) => [
                    k,
                    String(v ?? ""),
                ]),
            );
        }
    } catch {
        /* ignore */
    }
    return {};
}

type DraftVariantRow = {
    id: string;
    name: string;
    sku: string;
    price: string;
    stock: string;
    optionsJson: string;
};

function newDraftVariant(): DraftVariantRow {
    return {
        id: `draft-${Math.random().toString(36).slice(2)}`,
        name: "",
        sku: "",
        price: "",
        stock: "0",
        optionsJson: "{}",
    };
}

const emptyForm = () => ({
    title: "",
    description: "",
    price: "",
    compareAtPrice: "",
    costPrice: "",
    categoryId: "",
    stockQuantity: "0",
    lowStockThreshold: "10",
    trackInventory: true,
    sku: "",
    weight: "",
    dimLength: "",
    dimWidth: "",
    dimHeight: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    status: "DRAFT",
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
    const [draftVariants, setDraftVariants] = useState<DraftVariantRow[]>([]);
    const [variantsList, setVariantsList] = useState<SellerProductVariantRow[]>([]);
    const [newVariant, setNewVariant] = useState({
        name: "",
        sku: "",
        price: "",
        stock: "0",
        optionsJson: "{}",
    });

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
            setDraftVariants([]);
            setVariantsList([]);
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
                    const d = p.dimensions;
                    setVariantsList(p.variants ?? []);
                    setForm({
                        title: p.title,
                        description: p.description ?? "",
                        price: String(p.price),
                        compareAtPrice:
                            p.compareAtPrice != null ? String(p.compareAtPrice) : "",
                        costPrice: p.costPrice != null ? String(p.costPrice) : "",
                        categoryId: p.categoryId ?? "",
                        stockQuantity: String(p.stockQuantity),
                        lowStockThreshold: String(p.lowStockThreshold),
                        trackInventory: p.trackInventory,
                        sku: p.sku ?? "",
                        weight: p.weight != null ? String(p.weight) : "",
                        dimLength: d?.length != null ? String(d.length) : "",
                        dimWidth: d?.width != null ? String(d.width) : "",
                        dimHeight: d?.height != null ? String(d.height) : "",
                        metaTitle: p.metaTitle ?? "",
                        metaDescription: p.metaDescription ?? "",
                        metaKeywords: p.metaKeywords?.length ? p.metaKeywords.join(", ") : "",
                        status: p.status || "DRAFT",
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

        if (!dimensionInputsValid(form.dimLength, form.dimWidth, form.dimHeight)) {
            setError("Kích thước (dài / rộng / cao) không hợp lệ.");
            return;
        }

        const description = form.description.trim();
        const compareRaw = parsePrice(form.compareAtPrice);
        if (form.compareAtPrice.trim() !== "" && compareRaw === undefined) {
            setError("Giá so sánh không hợp lệ.");
            return;
        }

        const costParsed = parseOptionalFieldNumber(form.costPrice);
        if (!costParsed.ok) {
            setError("Giá vốn không hợp lệ.");
            return;
        }

        const weightParsed = parseOptionalFieldNumber(form.weight);
        if (!weightParsed.ok) {
            setError("Trọng lượng không hợp lệ.");
            return;
        }

        const categoryIdTrim = form.categoryId.trim();
        const stockQuantity = parseIntSafe(form.stockQuantity, 0);
        const lowStockThreshold = parseIntSafe(form.lowStockThreshold, 10);
        const skuTrim = form.sku.trim();
        const sku = skuTrim || undefined;

        const dimensions = buildDimensions(form.dimLength, form.dimWidth, form.dimHeight);
        const metaKeywordsArr = parseCommaKeywords(form.metaKeywords);
        const metaTitleTrim = form.metaTitle.trim();
        const metaDescTrim = form.metaDescription.trim();

        for (const d of draftVariants.filter((x) => x.name.trim())) {
            if (d.price.trim() !== "" && parsePrice(d.price) === undefined) {
                setError("Giá biến thể không hợp lệ.");
                return;
            }
            const oj = d.optionsJson.trim();
            if (oj) {
                try {
                    JSON.parse(oj);
                } catch {
                    setError("Options JSON của biến thể không hợp lệ.");
                    return;
                }
            }
        }

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
                const variantBodies = draftVariants
                    .filter((d) => d.name.trim())
                    .map((d) => {
                        const pVar = parsePrice(d.price);
                        const opts = parseOptionsJson(d.optionsJson);
                        return {
                            name: d.name.trim(),
                            sku: d.sku.trim() || undefined,
                            price: pVar,
                            stockQuantity: parseIntSafe(d.stock, 0),
                            options: Object.keys(opts).length ? opts : undefined,
                        };
                    });
                await sellerDashboardApi.createProduct({
                    title,
                    description: description || undefined,
                    price,
                    ...(compareRaw !== undefined ? { compareAtPrice: compareRaw } : {}),
                    ...(costParsed.value != null ? { costPrice: costParsed.value } : {}),
                    categoryId: categoryIdTrim || undefined,
                    stockQuantity,
                    lowStockThreshold,
                    trackInventory: form.trackInventory,
                    sku,
                    ...(weightParsed.value != null ? { weight: weightParsed.value } : {}),
                    ...(dimensions != null ? { dimensions } : {}),
                    ...(metaTitleTrim ? { metaTitle: metaTitleTrim } : {}),
                    ...(metaDescTrim ? { metaDescription: metaDescTrim } : {}),
                    ...(metaKeywordsArr.length > 0 ? { metaKeywords: metaKeywordsArr } : {}),
                    images: imagePayload,
                    ...(variantBodies.length > 0 ? { variants: variantBodies } : {}),
                });
            } else if (productId) {
                await sellerDashboardApi.updateProduct(productId, {
                    title,
                    description: description || undefined,
                    price,
                    compareAtPrice:
                        form.compareAtPrice.trim() === "" ? null : (compareRaw ?? null),
                    costPrice: costParsed.value,
                    categoryId: categoryIdTrim ? categoryIdTrim : null,
                    stockQuantity,
                    lowStockThreshold,
                    trackInventory: form.trackInventory,
                    sku: skuTrim === "" ? null : skuTrim,
                    weight: weightParsed.value,
                    dimensions,
                    metaTitle: metaTitleTrim === "" ? null : metaTitleTrim,
                    metaDescription: metaDescTrim === "" ? null : metaDescTrim,
                    metaKeywords: metaKeywordsArr,
                    status: form.status,
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

    async function handleAddVariantEdit() {
        if (!productId || mode !== "edit") return;
        const name = newVariant.name.trim();
        if (!name) {
            setError("Nhập tên biến thể.");
            return;
        }
        const pr = parsePrice(newVariant.price);
        if (newVariant.price.trim() !== "" && pr === undefined) {
            setError("Giá biến thể không hợp lệ.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const created = await sellerDashboardApi.createProductVariant(productId, {
                name,
                sku: newVariant.sku.trim() || undefined,
                price: pr,
                stockQuantity: parseIntSafe(newVariant.stock, 0),
                options: parseOptionsJson(newVariant.optionsJson),
            });
            setVariantsList((v) => [...v, created]);
            setNewVariant({
                name: "",
                sku: "",
                price: "",
                stock: "0",
                optionsJson: "{}",
            });
        } catch (e) {
            setError(
                e instanceof HttpError ? e.message : "Không thêm được biến thể.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteVariant(variantId: string) {
        if (!productId) return;
        if (!window.confirm("Xóa biến thể này?")) return;
        setSaving(true);
        setError(null);
        try {
            await sellerDashboardApi.deleteProductVariant(productId, variantId);
            setVariantsList((v) => v.filter((x) => x.id !== variantId));
        } catch (e) {
            setError(
                e instanceof HttpError ? e.message : "Không xóa được biến thể.",
            );
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
                className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl"
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
                    <div className="mt-4 space-y-6">
                        <section className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Thông tin cơ bản
                            </h3>
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
                                        setForm((f) => ({
                                            ...f,
                                            description: e.target.value,
                                        }))
                                    }
                                    rows={4}
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    disabled={saving}
                                />
                            </label>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Giá & danh mục
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block text-sm font-medium">
                                    Giá bán (đ) *
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
                                <label className="block text-sm font-medium sm:col-span-2">
                                    Giá vốn (đ)
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={form.costPrice}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, costPrice: e.target.value }))
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
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Tồn kho
                            </h3>
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
                            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={form.trackInventory}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            trackInventory: e.target.checked,
                                        }))
                                    }
                                    disabled={saving}
                                    className="h-4 w-4 rounded border-border"
                                />
                                Theo dõi tồn kho
                            </label>
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
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Vận chuyển
                            </h3>
                            <label className="block text-sm font-medium">
                                Trọng lượng (kg)
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={form.weight}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, weight: e.target.value }))
                                    }
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    disabled={saving}
                                />
                            </label>
                            <div>
                                <p className="text-sm font-medium">
                                    Kích thước (cm): dài × rộng × cao
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="Dài"
                                        value={form.dimLength}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                dimLength: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                                        disabled={saving}
                                    />
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="Rộng"
                                        value={form.dimWidth}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                dimWidth: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                                        disabled={saving}
                                    />
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="Cao"
                                        value={form.dimHeight}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                dimHeight: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                SEO
                            </h3>
                            <label className="block text-sm font-medium">
                                Meta title
                                <input
                                    type="text"
                                    value={form.metaTitle}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, metaTitle: e.target.value }))
                                    }
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    disabled={saving}
                                />
                            </label>
                            <label className="block text-sm font-medium">
                                Meta description
                                <textarea
                                    value={form.metaDescription}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            metaDescription: e.target.value,
                                        }))
                                    }
                                    rows={2}
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    disabled={saving}
                                />
                            </label>
                            <label className="block text-sm font-medium">
                                Từ khóa (phân cách bằng dấu phẩy)
                                <input
                                    type="text"
                                    value={form.metaKeywords}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            metaKeywords: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    disabled={saving}
                                />
                            </label>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Biến thể (SKU / size / màu)
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Thêm từng dòng. Trường options là JSON object, ví dụ{" "}
                                <code className="rounded bg-muted px-1">
                                    {`{"Màu":"Đỏ","Size":"M"}`}
                                </code>
                                .
                            </p>
                            {mode === "create" ? (
                                <div className="space-y-3">
                                    {draftVariants.map((row) => (
                                        <div
                                            key={row.id}
                                            className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2"
                                        >
                                            <input
                                                placeholder="Tên hiển thị *"
                                                className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                                value={row.name}
                                                onChange={(e) =>
                                                    setDraftVariants((list) =>
                                                        list.map((r) =>
                                                            r.id === row.id
                                                                ? { ...r, name: e.target.value }
                                                                : r,
                                                        ),
                                                    )
                                                }
                                                disabled={saving}
                                            />
                                            <input
                                                placeholder="SKU"
                                                className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                                value={row.sku}
                                                onChange={(e) =>
                                                    setDraftVariants((list) =>
                                                        list.map((r) =>
                                                            r.id === row.id
                                                                ? { ...r, sku: e.target.value }
                                                                : r,
                                                        ),
                                                    )
                                                }
                                                disabled={saving}
                                            />
                                            <input
                                                placeholder="Giá (đ)"
                                                inputMode="decimal"
                                                className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                                value={row.price}
                                                onChange={(e) =>
                                                    setDraftVariants((list) =>
                                                        list.map((r) =>
                                                            r.id === row.id
                                                                ? { ...r, price: e.target.value }
                                                                : r,
                                                        ),
                                                    )
                                                }
                                                disabled={saving}
                                            />
                                            <input
                                                placeholder="Tồn"
                                                type="number"
                                                min={0}
                                                className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                                value={row.stock}
                                                onChange={(e) =>
                                                    setDraftVariants((list) =>
                                                        list.map((r) =>
                                                            r.id === row.id
                                                                ? { ...r, stock: e.target.value }
                                                                : r,
                                                        ),
                                                    )
                                                }
                                                disabled={saving}
                                            />
                                            <textarea
                                                placeholder='Options JSON ({"Màu":"Đỏ"})'
                                                className="sm:col-span-2 rounded border border-border bg-background px-2 py-1.5 text-sm"
                                                rows={2}
                                                value={row.optionsJson}
                                                onChange={(e) =>
                                                    setDraftVariants((list) =>
                                                        list.map((r) =>
                                                            r.id === row.id
                                                                ? {
                                                                      ...r,
                                                                      optionsJson: e.target.value,
                                                                  }
                                                                : r,
                                                        ),
                                                    )
                                                }
                                                disabled={saving}
                                            />
                                            <div className="sm:col-span-2">
                                                <button
                                                    type="button"
                                                    className="text-sm text-destructive hover:underline"
                                                    disabled={saving}
                                                    onClick={() =>
                                                        setDraftVariants((list) =>
                                                            list.filter((r) => r.id !== row.id),
                                                        )
                                                    }
                                                >
                                                    Xóa dòng
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="text-sm font-medium text-primary hover:underline"
                                        disabled={saving}
                                        onClick={() =>
                                            setDraftVariants((v) => [...v, newDraftVariant()])
                                        }
                                    >
                                        + Thêm biến thể (khi tạo mới)
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {variantsList.length > 0 ? (
                                        <ul className="space-y-2 text-sm">
                                            {variantsList.map((v) => (
                                                <li
                                                    key={v.id}
                                                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                                                >
                                                    <div>
                                                        <span className="font-medium">
                                                            {v.variantName}
                                                        </span>
                                                        {v.sku ? (
                                                            <span className="text-muted-foreground">
                                                                {" "}
                                                                · SKU {v.sku}
                                                            </span>
                                                        ) : null}
                                                        {v.price != null ? (
                                                            <span className="text-primary">
                                                                {" "}
                                                                · {v.price} đ
                                                            </span>
                                                        ) : null}
                                                        <span className="text-muted-foreground">
                                                            {" "}
                                                            · Tồn {v.stockQuantity}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="text-destructive hover:underline"
                                                        disabled={saving}
                                                        onClick={() =>
                                                            void handleDeleteVariant(v.id)
                                                        }
                                                    >
                                                        Xóa
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Chưa có biến thể.
                                        </p>
                                    )}
                                    <div className="grid gap-2 rounded-lg border border-dashed border-border p-3 sm:grid-cols-2">
                                        <input
                                            placeholder="Tên biến thể *"
                                            className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                            value={newVariant.name}
                                            onChange={(e) =>
                                                setNewVariant((n) => ({
                                                    ...n,
                                                    name: e.target.value,
                                                }))
                                            }
                                            disabled={saving}
                                        />
                                        <input
                                            placeholder="SKU"
                                            className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                            value={newVariant.sku}
                                            onChange={(e) =>
                                                setNewVariant((n) => ({
                                                    ...n,
                                                    sku: e.target.value,
                                                }))
                                            }
                                            disabled={saving}
                                        />
                                        <input
                                            placeholder="Giá (đ)"
                                            inputMode="decimal"
                                            className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                            value={newVariant.price}
                                            onChange={(e) =>
                                                setNewVariant((n) => ({
                                                    ...n,
                                                    price: e.target.value,
                                                }))
                                            }
                                            disabled={saving}
                                        />
                                        <input
                                            placeholder="Tồn"
                                            type="number"
                                            min={0}
                                            className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                            value={newVariant.stock}
                                            onChange={(e) =>
                                                setNewVariant((n) => ({
                                                    ...n,
                                                    stock: e.target.value,
                                                }))
                                            }
                                            disabled={saving}
                                        />
                                        <textarea
                                            placeholder='Options JSON'
                                            className="sm:col-span-2 rounded border border-border bg-background px-2 py-1.5 text-sm"
                                            rows={2}
                                            value={newVariant.optionsJson}
                                            onChange={(e) =>
                                                setNewVariant((n) => ({
                                                    ...n,
                                                    optionsJson: e.target.value,
                                                }))
                                            }
                                            disabled={saving}
                                        />
                                        <div className="sm:col-span-2">
                                            <button
                                                type="button"
                                                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                                                disabled={saving}
                                                onClick={() => void handleAddVariantEdit()}
                                            >
                                                Thêm biến thể
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {mode === "edit" ? (
                            <section className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Trạng thái
                                </h3>
                                <label className="block text-sm font-medium">
                                    Trạng thái hiển thị
                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, status: e.target.value }))
                                        }
                                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                        disabled={saving}
                                    >
                                        {PRODUCT_STATUS_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </section>
                        ) : null}

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
