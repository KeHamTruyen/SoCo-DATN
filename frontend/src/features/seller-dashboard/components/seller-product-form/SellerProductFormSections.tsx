import type { TFunction } from "i18next";
import type { Dispatch, SetStateAction } from "react";
import type { SellerCategoryOption, SellerProductImageRow, SellerProductVariantRow } from "../../types/sellerDashboard.types";
import type { DraftVariantRow, SellerProductFormFields } from "../../utils/sellerProductFormUtils";
import { newDraftVariant } from "../../utils/sellerProductFormUtils";

type SetForm = Dispatch<SetStateAction<SellerProductFormFields>>;

interface SavingProps {
    saving: boolean;
}

export function SellerProductFormBasicSection({
    form,
    setForm,
    saving,
}: SavingProps & { form: SellerProductFormFields; setForm: SetForm }) {
    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thông tin cơ bản</h3>
            <label className="block text-sm font-medium">
                Tên sản phẩm *
                <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={saving}
                />
            </label>
            <label className="block text-sm font-medium">
                Mô tả
                <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={saving}
                />
            </label>
        </section>
    );
}

export function SellerProductFormPriceCategorySection({
    form,
    setForm,
    saving,
    categories,
}: SavingProps & {
    form: SellerProductFormFields;
    setForm: SetForm;
    categories: SellerCategoryOption[];
}) {
    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Giá & danh mục</h3>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                    Giá bán (đ) *
                    <input
                        type="text"
                        inputMode="decimal"
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
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
                        onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
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
                        onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        disabled={saving}
                    />
                </label>
            </div>
            <label className="block text-sm font-medium">
                Danh mục
                <select
                    value={form.categoryId}
                    onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
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
    );
}

export function SellerProductFormInventorySection({
    form,
    setForm,
    saving,
    t,
}: SavingProps & { form: SellerProductFormFields; setForm: SetForm; t: TFunction }) {
    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tồn kho</h3>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                    Tồn kho
                    <input
                        type="number"
                        min={0}
                        value={form.stockQuantity}
                        onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
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
                        onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        disabled={saving}
                    />
                </label>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                    type="checkbox"
                    checked={form.trackInventory}
                    onChange={(e) => setForm((f) => ({ ...f, trackInventory: e.target.checked }))}
                    disabled={saving}
                    className="h-4 w-4 rounded border-border"
                />
                {t("sellerDashboard.productForm.trackInventory", "Theo dõi tồn kho")}
            </label>
            <label className="block text-sm font-medium">
                SKU
                <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={saving}
                />
            </label>
        </section>
    );
}

export function SellerProductFormShippingSection({
    form,
    setForm,
    saving,
    t,
}: SavingProps & { form: SellerProductFormFields; setForm: SetForm; t: TFunction }) {
    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("sellerDashboard.productForm.shippingSection", "Vận chuyển")}
            </h3>
            <label className="block text-sm font-medium">
                {t("sellerDashboard.productForm.weightLabel", "Trọng lượng (kg)")}
                <input
                    type="text"
                    inputMode="decimal"
                    value={form.weight}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={saving}
                />
            </label>
            <div>
                <p className="text-sm font-medium">
                    {t("sellerDashboard.productForm.dimensionsLabel", "Kích thước (cm): dài × rộng × cao")}
                </p>
                <div className="mt-1 grid grid-cols-3 gap-2">
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Dài"
                        value={form.dimLength}
                        onChange={(e) => setForm((f) => ({ ...f, dimLength: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                        disabled={saving}
                    />
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Rộng"
                        value={form.dimWidth}
                        onChange={(e) => setForm((f) => ({ ...f, dimWidth: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                        disabled={saving}
                    />
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Cao"
                        value={form.dimHeight}
                        onChange={(e) => setForm((f) => ({ ...f, dimHeight: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                        disabled={saving}
                    />
                </div>
            </div>
        </section>
    );
}

export function SellerProductFormSeoSection({
    form,
    setForm,
    saving,
    t,
}: SavingProps & { form: SellerProductFormFields; setForm: SetForm; t: TFunction }) {
    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO</h3>
            <label className="block text-sm font-medium">
                {t("sellerDashboard.productForm.metaTitle", "Meta title")}
                <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={saving}
                />
            </label>
            <label className="block text-sm font-medium">
                Meta description
                <textarea
                    value={form.metaDescription}
                    onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={saving}
                />
            </label>
            <label className="block text-sm font-medium">
                {t("sellerDashboard.productForm.metaKeywords", "Từ khóa (phân cách bằng dấu phẩy)")}
                <input
                    type="text"
                    value={form.metaKeywords}
                    onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={saving}
                />
            </label>
        </section>
    );
}

type StatusOpt = { readonly value: string; readonly label: string };

export function SellerProductFormEditStatusSection({
    form,
    setForm,
    saving,
    t,
    productStatusOptions,
}: SavingProps & {
    form: SellerProductFormFields;
    setForm: SetForm;
    t: TFunction;
    productStatusOptions: readonly StatusOpt[];
}) {
    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("sellerDashboard.productForm.statusSection", "Trạng thái")}
            </h3>
            <label className="block text-sm font-medium">
                {t("sellerDashboard.productForm.displayStatus", "Trạng thái hiển thị")}
                <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={saving}
                >
                    {productStatusOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </label>
        </section>
    );
}

export function SellerProductFormImagesSection({
    mode,
    visibleExisting,
    pendingFiles,
    saving,
    t,
    setRemovedImageIds,
    setPendingFiles,
}: {
    mode: "create" | "edit";
    visibleExisting: SellerProductImageRow[];
    pendingFiles: File[];
    saving: boolean;
    t: TFunction;
    setRemovedImageIds: Dispatch<SetStateAction<Set<string>>>;
    setPendingFiles: Dispatch<SetStateAction<File[]>>;
}) {
    return (
        <div>
            <p className="text-sm font-medium">{t("sellerDashboard.productForm.productImages", "Ảnh sản phẩm")}</p>
            {mode === "edit" && visibleExisting.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                    {visibleExisting.map((im) => (
                        <li key={im.id} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">
                            <img src={im.imageUrl} alt="" className="h-full w-full object-cover" />
                            <button
                                type="button"
                                title={t("sellerDashboard.productForm.removeImage", "Gỡ ảnh")}
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
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    setPendingFiles(files);
                    e.target.value = "";
                }}
            />
            {pendingFiles.length > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                    {t("sellerDashboard.productForm.pendingImagesCount", "Đã chọn {{count}} ảnh mới để tải lên khi lưu.", {
                        count: pendingFiles.length,
                    })}
                </p>
            ) : null}
        </div>
    );
}

export function SellerProductFormVariantsSection({
    mode,
    draftVariants,
    setDraftVariants,
    variantsList,
    newVariant,
    setNewVariant,
    saving,
    t,
    onAddVariantEdit,
    onDeleteVariant,
}: {
    mode: "create" | "edit";
    draftVariants: DraftVariantRow[];
    setDraftVariants: Dispatch<SetStateAction<DraftVariantRow[]>>;
    variantsList: SellerProductVariantRow[];
    newVariant: {
        name: string;
        sku: string;
        price: string;
        stock: string;
        optionsJson: string;
    };
    setNewVariant: Dispatch<
        SetStateAction<{
            name: string;
            sku: string;
            price: string;
            stock: string;
            optionsJson: string;
        }>
    >;
    saving: boolean;
    t: TFunction;
    onAddVariantEdit: () => void | Promise<void>;
    onDeleteVariant: (id: string) => void | Promise<void>;
}) {
    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("sellerDashboard.productForm.variantsSection", "Biến thể (SKU / size / màu)")}
            </h3>
            <p className="text-xs text-muted-foreground">
                {t("sellerDashboard.productForm.variantsNote", "Thêm từng dòng. Trường options là JSON object, ví dụ")}{" "}
                <code className="rounded bg-muted px-1">{`{"Màu":"Đỏ","Size":"M"}`}</code>.
            </p>
            {mode === "create" ? (
                <div className="space-y-3">
                    {draftVariants.map((row) => (
                        <div key={row.id} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                            <input
                                placeholder={t("sellerDashboard.productForm.variantNamePlaceholder", "Tên hiển thị *")}
                                className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                value={row.name}
                                onChange={(e) =>
                                    setDraftVariants((list) =>
                                        list.map((r) => (r.id === row.id ? { ...r, name: e.target.value } : r)),
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
                                        list.map((r) => (r.id === row.id ? { ...r, sku: e.target.value } : r)),
                                    )
                                }
                                disabled={saving}
                            />
                            <input
                                placeholder={t("sellerDashboard.productForm.variantPricePlaceholder", "Giá (đ)")}
                                inputMode="decimal"
                                className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                value={row.price}
                                onChange={(e) =>
                                    setDraftVariants((list) =>
                                        list.map((r) => (r.id === row.id ? { ...r, price: e.target.value } : r)),
                                    )
                                }
                                disabled={saving}
                            />
                            <input
                                placeholder={t("sellerDashboard.productForm.variantStockPlaceholder", "Tồn")}
                                type="number"
                                min={0}
                                className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                                value={row.stock}
                                onChange={(e) =>
                                    setDraftVariants((list) =>
                                        list.map((r) => (r.id === row.id ? { ...r, stock: e.target.value } : r)),
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
                                            r.id === row.id ? { ...r, optionsJson: e.target.value } : r,
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
                                    onClick={() => setDraftVariants((list) => list.filter((r) => r.id !== row.id))}
                                >
                                    {t("sellerDashboard.productForm.removeVariantRow", "Xóa dòng")}
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="text-sm font-medium text-primary hover:underline"
                        disabled={saving}
                        onClick={() => setDraftVariants((v) => [...v, newDraftVariant()])}
                    >
                        + {t("sellerDashboard.productForm.addVariantBtn", "Thêm biến thể (khi tạo mới)")}
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
                                        <span className="font-medium">{v.variantName}</span>
                                        {v.sku ? (
                                            <span className="text-muted-foreground"> · SKU {v.sku}</span>
                                        ) : null}
                                        {v.price != null ? (
                                            <span className="text-primary">
                                                {" "}
                                                · {v.price} {t("common.currency", "đ")}
                                            </span>
                                        ) : null}
                                        <span className="text-muted-foreground">
                                            {" "}
                                            · {t("sellerDashboard.productForm.stockLabelInfo", "Tồn")} {v.stockQuantity}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-destructive hover:underline"
                                        disabled={saving}
                                        onClick={() => void onDeleteVariant(v.id)}
                                    >
                                        {t("common.delete", "Xóa")}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {t("sellerDashboard.productForm.noVariants", "Chưa có biến thể.")}
                        </p>
                    )}
                    <div className="grid gap-2 rounded-lg border border-dashed border-border p-3 sm:grid-cols-2">
                        <input
                            placeholder={t("sellerDashboard.productForm.variantNamePlaceholder", "Tên biến thể *")}
                            className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                            value={newVariant.name}
                            onChange={(e) => setNewVariant((n) => ({ ...n, name: e.target.value }))}
                            disabled={saving}
                        />
                        <input
                            placeholder="SKU"
                            className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                            value={newVariant.sku}
                            onChange={(e) => setNewVariant((n) => ({ ...n, sku: e.target.value }))}
                            disabled={saving}
                        />
                        <input
                            placeholder={t("sellerDashboard.productForm.variantPricePlaceholder", "Giá (đ)")}
                            inputMode="decimal"
                            className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                            value={newVariant.price}
                            onChange={(e) => setNewVariant((n) => ({ ...n, price: e.target.value }))}
                            disabled={saving}
                        />
                        <input
                            placeholder={t("sellerDashboard.productForm.variantStockPlaceholder", "Tồn")}
                            type="number"
                            min={0}
                            className="rounded border border-border bg-background px-2 py-1.5 text-sm"
                            value={newVariant.stock}
                            onChange={(e) => setNewVariant((n) => ({ ...n, stock: e.target.value }))}
                            disabled={saving}
                        />
                        <textarea
                            placeholder="Options JSON"
                            className="sm:col-span-2 rounded border border-border bg-background px-2 py-1.5 text-sm"
                            rows={2}
                            value={newVariant.optionsJson}
                            onChange={(e) => setNewVariant((n) => ({ ...n, optionsJson: e.target.value }))}
                            disabled={saving}
                        />
                        <div className="sm:col-span-2">
                            <button
                                type="button"
                                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                                disabled={saving}
                                onClick={() => void onAddVariantEdit()}
                            >
                                {t("sellerDashboard.productForm.addVariantAction", "Thêm biến thể")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
