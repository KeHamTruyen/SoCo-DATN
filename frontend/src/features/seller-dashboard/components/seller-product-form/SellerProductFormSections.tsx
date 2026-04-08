import type { TFunction } from "i18next";
import { useMemo, useState, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import type { SellerCategoryOption, SellerProductImageRow } from "../../types/sellerDashboard.types";
import type { DraftVariantRow, SellerProductFormFields, VariantGroup, VariantLoadMode } from "../../utils/sellerProductFormUtils";
import { variantOptionMapDisplay } from "../../utils/sellerProductFormUtils";

type SetForm = Dispatch<SetStateAction<SellerProductFormFields>>;

interface SavingProps {
    saving: boolean;
}

function normalizeToken(token: string): string {
    return token.trim().replace(/\s+/g, " ");
}

function ChipInput({
    label,
    placeholder,
    values,
    onChange,
    saving,
    suggestions,
    hint,
    allowCustom = true,
    noMatchText,
}: {
    label: string;
    placeholder: string;
    values: string[];
    onChange: (next: string[]) => void;
    saving: boolean;
    suggestions?: string[];
    hint?: string;
    allowCustom?: boolean;
    noMatchText?: string;
}) {
    const [query, setQuery] = useState("");
    const lowerValues = useMemo(() => values.map((v) => v.toLowerCase()), [values]);
    const filteredSuggestions = useMemo(() => {
        if (!suggestions || query.trim() === "") return [];
        const q = query.trim().toLowerCase();
        return suggestions
            .filter((item) => item.toLowerCase().includes(q))
            .filter((item) => !lowerValues.includes(item.toLowerCase()))
            .slice(0, 6);
    }, [suggestions, query, lowerValues]);

    function addValue(raw: string) {
        const normalizedRaw = normalizeToken(raw);
        let token = normalizedRaw;
        if (!allowCustom) {
            const matched =
                (suggestions ?? []).find(
                    (item) => item.toLowerCase() === normalizedRaw.toLowerCase(),
                ) ?? filteredSuggestions[0];
            if (!matched) return;
            token = matched;
        }
        if (!token) return;
        if (lowerValues.includes(token.toLowerCase())) {
            setQuery("");
            return;
        }
        onChange([...values, token]);
        setQuery("");
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            event.preventDefault();
            addValue(query);
            return;
        }
        if (event.key === "Backspace" && query.trim() === "" && values.length > 0) {
            onChange(values.slice(0, -1));
        }
    }

    return (
        <label className="block text-sm font-medium">
            {label}
            <div className="mt-1 rounded-lg border border-border bg-background px-2 py-2">
                <div className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-w-48 flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
                        placeholder={placeholder}
                        disabled={saving}
                    />
                </div>
                {filteredSuggestions.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
                        {filteredSuggestions.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className="rounded-full border border-border bg-muted px-2 py-1 text-xs text-foreground hover:border-primary/40"
                                onClick={() => addValue(item)}
                                disabled={saving}
                            >
                                + {item}
                            </button>
                        ))}
                    </div>
                ) : null}
                {!allowCustom && query.trim() !== "" && filteredSuggestions.length === 0 ? (
                    <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                        {noMatchText}
                    </p>
                ) : null}
                {values.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
                        {values.map((item) => (
                            <span
                                key={item}
                                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                            >
                                {item}
                                <button
                                    type="button"
                                    className="rounded px-1 text-primary/80 hover:bg-primary/20 hover:text-primary"
                                    onClick={() => onChange(values.filter((v) => v !== item))}
                                    disabled={saving}
                                    aria-label={`Remove ${item}`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </label>
    );
}

export function SellerProductFormBasicSection({
    form,
    setForm,
    saving,
    t,
}: SavingProps & { form: SellerProductFormFields; setForm: SetForm; t: TFunction }) {
    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("sellerDashboard.productForm.basicInfo", "Thông tin cơ bản")}
            </h3>
            <label className="block text-sm font-medium">
                {t("sellerDashboard.productForm.productName", "Tên sản phẩm *")}
                <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={saving}
                />
            </label>
            <label className="block text-sm font-medium">
                {t("sellerDashboard.productForm.description", "Mô tả")}
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
    t,
}: SavingProps & {
    form: SellerProductFormFields;
    setForm: SetForm;
    categories: SellerCategoryOption[];
    t: TFunction;
}) {
    const categoryMap = useMemo(
        () => new Map(categories.map((category) => [category.id, category.name])),
        [categories],
    );
    const selectedCategoryNames = form.categoryIds
        .map((id) => categoryMap.get(id))
        .filter((name): name is string => Boolean(name));

    const allCategoryNames = categories.map((category) => category.name);

    function syncCategorySelectionByNames(names: string[]) {
        const lowerNames = new Set(names.map((name) => name.toLowerCase()));
        const nextCategoryIds = categories
            .filter((category) => lowerNames.has(category.name.toLowerCase()))
            .map((category) => category.id);
        setForm((f) => ({ ...f, categoryIds: nextCategoryIds }));
    }

    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("sellerDashboard.productForm.priceAndCategory", "Giá & danh mục")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                    {t("sellerDashboard.productForm.priceLabel", "Giá bán (đ) *")}
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
                    {t("sellerDashboard.productForm.comparePriceLabel", "Giá so sánh (đ)")}
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
                    {t("sellerDashboard.productForm.costPriceLabel", "Giá vốn (đ)")}
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
            <ChipInput
                label={t("sellerDashboard.productForm.categoryLabel", "Danh mục")}
                placeholder={t("sellerDashboard.productForm.categoryInputPlaceholder", "Type to search then press Enter")}
                values={selectedCategoryNames}
                onChange={syncCategorySelectionByNames}
                suggestions={allCategoryNames}
                saving={saving || categories.length === 0}
                allowCustom={false}
                noMatchText={t("sellerDashboard.productForm.categoryNoMatch", "No categories match")}
                hint={t(
                    "sellerDashboard.productForm.categoryHint",
                    "Chỉ chọn danh mục có sẵn do admin tạo. Nhấn Enter để thêm nhanh.",
                )}
            />
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
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("sellerDashboard.productForm.inventorySection", "Tồn kho")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                    {t("sellerDashboard.productForm.stockQuantity", "Tồn kho")}
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
                    {t("sellerDashboard.productForm.lowStockThreshold", "Ngưỡng cảnh báo tồn")}
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
                        placeholder={t("sellerDashboard.productForm.dimLengthPlaceholder", "Dài")}
                        value={form.dimLength}
                        onChange={(e) => setForm((f) => ({ ...f, dimLength: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                        disabled={saving}
                    />
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder={t("sellerDashboard.productForm.dimWidthPlaceholder", "Rộng")}
                        value={form.dimWidth}
                        onChange={(e) => setForm((f) => ({ ...f, dimWidth: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                        disabled={saving}
                    />
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder={t("sellerDashboard.productForm.dimHeightPlaceholder", "Cao")}
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
                {t("sellerDashboard.productForm.metaDescription", "Meta description")}
                <textarea
                    value={form.metaDescription}
                    onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={saving}
                />
            </label>
            <ChipInput
                label={t("sellerDashboard.productForm.metaKeywords", "Từ khóa SEO")}
                placeholder={t("sellerDashboard.productForm.keywordInputPlaceholder", "Nhập từ khóa rồi nhấn Enter")}
                values={form.metaKeywords}
                onChange={(next) => setForm((f) => ({ ...f, metaKeywords: next }))}
                saving={saving}
                hint={t("sellerDashboard.productForm.keywordHint", "Nhấn Enter để thêm từng từ khóa.")}
            />
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
                                onClick={() => {
                                    const ok = window.confirm(
                                        t("sellerDashboard.productForm.confirmRemoveImage", "Gỡ ảnh này?"),
                                    );
                                    if (!ok) return;
                                    setRemovedImageIds((prev) => {
                                        const n = new Set(prev);
                                        n.add(im.id);
                                        return n;
                                    });
                                }}
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
    draftVariants,
    setDraftVariants,
    variantGroups,
    onAddVariantGroup,
    onUpdateVariantGroup,
    onRemoveVariantGroup,
    loadModeOpen,
    setLoadModeOpen,
    onLoadVariantRows,
    saving,
    t,
}: {
    draftVariants: DraftVariantRow[];
    setDraftVariants: Dispatch<SetStateAction<DraftVariantRow[]>>;
    variantGroups: VariantGroup[];
    onAddVariantGroup: () => void;
    onUpdateVariantGroup: (id: string, patch: Partial<VariantGroup>) => void;
    onRemoveVariantGroup: (id: string) => void;
    loadModeOpen: boolean;
    setLoadModeOpen: Dispatch<SetStateAction<boolean>>;
    onLoadVariantRows: (mode: VariantLoadMode) => void;
    saving: boolean;
    t: TFunction;
}) {
    const variantRowsSorted = [...draftVariants].sort((a, b) =>
        variantOptionMapDisplay(a.optionMap).localeCompare(variantOptionMapDisplay(b.optionMap)),
    );

    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("sellerDashboard.productForm.variantsSection", "Biến thể (SKU / size / màu)")}
            </h3>
            <div className="space-y-3 rounded-lg border border-border p-3">
                {variantGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t("sellerDashboard.productForm.variantNoGroupsHint", "Add at least one variant name.")}
                    </p>
                ) : null}
                {variantGroups.map((group) => (
                    <div key={group.id} className="grid gap-2 rounded-lg border border-border bg-card p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
                        <label className="block text-sm font-medium">
                            {t("sellerDashboard.productForm.variantNameLabel", "Variant name")}
                            <input
                                type="text"
                                value={group.name}
                                onChange={(e) => onUpdateVariantGroup(group.id, { name: e.target.value })}
                                className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
                                disabled={saving}
                            />
                        </label>
                        <ChipInput
                            label={t("sellerDashboard.productForm.variantValuesLabel", "Variant values")}
                            placeholder={t("sellerDashboard.productForm.variantValuePlaceholder", "Type value then press Enter")}
                            values={group.values}
                            onChange={(values) => onUpdateVariantGroup(group.id, { values })}
                            saving={saving}
                        />
                        <button
                            type="button"
                            className="self-end rounded border border-destructive/30 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                            onClick={() => onRemoveVariantGroup(group.id)}
                            disabled={saving}
                        >
                            {t("common.delete", "Delete")}
                        </button>
                    </div>
                ))}
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-medium hover:bg-muted/70"
                        disabled={saving}
                        onClick={onAddVariantGroup}
                    >
                        + {t("sellerDashboard.productForm.addVariantNameAction", "Add Variant")}
                    </button>
                    <button
                        type="button"
                        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                        disabled={saving}
                        onClick={() => setLoadModeOpen(true)}
                    >
                        {t("sellerDashboard.productForm.loadVariantsAction", "Load variants")}
                    </button>
                </div>
            </div>
            <div className="space-y-3 rounded-lg border border-border">
                <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 border-b border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground md:grid">
                    <span>{t("sellerDashboard.productForm.variantCombination", "Combination")}</span>
                    <span>{t("sellerDashboard.productForm.variantPricePlaceholder", "Giá (đ)")}</span>
                    <span>{t("sellerDashboard.productForm.variantStockPlaceholder", "Tồn")}</span>
                    <span>{t("common.actions", "Thao tác")}</span>
                </div>
                <div className="space-y-2 p-3">
                    {variantRowsSorted.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t("sellerDashboard.productForm.variantNoRowsHint", "No variant rows. Click Load variants.")}
                        </p>
                    ) : null}
                    {variantRowsSorted.map((row) => (
                        <div
                            key={row.id}
                            className="grid gap-2 rounded-lg border border-border bg-card p-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                        >
                            <span className="self-center text-sm font-medium">{variantOptionMapDisplay(row.optionMap)}</span>
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
                            <button
                                type="button"
                                className="rounded border border-destructive/30 px-2 py-1 text-sm text-destructive hover:bg-destructive/10"
                                disabled={saving}
                                onClick={() => setDraftVariants((list) => list.filter((r) => r.id !== row.id))}
                            >
                                {t("common.delete", "Xóa")}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {loadModeOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/50"
                        aria-label={t("sellerDashboard.productForm.variantLoadModeCancel", "Cancel")}
                        onClick={() => setLoadModeOpen(false)}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                        <h4 className="text-base font-bold">
                            {t("sellerDashboard.productForm.variantLoadModeTitle", "Choose load mode")}
                        </h4>
                        <div className="mt-4 space-y-2">
                            <button
                                type="button"
                                className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-muted"
                                onClick={() => {
                                    onLoadVariantRows("missing-only");
                                    setLoadModeOpen(false);
                                }}
                            >
                                {t("sellerDashboard.productForm.variantLoadModeMissingOnly", "Generate missing only")}
                            </button>
                            <button
                                type="button"
                                className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-muted"
                                onClick={() => {
                                    onLoadVariantRows("regenerate-all");
                                    setLoadModeOpen(false);
                                }}
                            >
                                {t("sellerDashboard.productForm.variantLoadModeRegenerateAll", "Regenerate all (reset)")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
