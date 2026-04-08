import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { sellerDashboardApi } from "../api/sellerDashboardApi";
import { uploadApi } from "../../upload/api/uploadApi";
import type {
    SellerCategoryOption,
    SellerProductDetail,
    SellerProductImageRow,
    SellerProductVariantRow,
} from "../types/sellerDashboard.types";
import { HttpError } from "../../../shared/api/httpClient";
import {
    buildVariantMatrixRowsDynamic,
    buildDimensions,
    draftRowsFromVariants,
    dimensionInputsValid,
    emptyForm,
    hasDuplicateVariantGroupNames,
    normalizeKeywordList,
    normalizeVariantGroups,
    parseIntSafe,
    parseOptionalFieldNumber,
    parsePrice,
    variantGroupsFromRows,
    variantOptionMapDisplay,
    type VariantGroup,
    type VariantLoadMode,
    type DraftVariantRow,
} from "../utils/sellerProductFormUtils";

export type SellerProductFormMode = "create" | "edit";

function useProductStatusOptions() {
    const { t } = useTranslation();
    return [
        { value: "DRAFT", label: t("sellerDashboard.productForm.statusDraft", "Nháp") },
        { value: "ACTIVE", label: t("sellerDashboard.productForm.statusActive", "Đang bán") },
        { value: "OUT_OF_STOCK", label: t("sellerDashboard.productForm.statusOutOfStock", "Hết hàng") },
        { value: "ARCHIVED", label: t("sellerDashboard.productForm.statusArchived", "Lưu trữ") },
    ] as const;
}

export function useSellerProductForm(
    open: boolean,
    mode: SellerProductFormMode,
    productId: string | null,
    onClose: () => void,
    onSuccess: () => void,
) {
    const { t } = useTranslation();
    const PRODUCT_STATUS_OPTIONS = useProductStatusOptions();
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
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
    const [loadModeOpen, setLoadModeOpen] = useState(false);

    function resetFormState() {
        setForm(emptyForm());
        setExistingImages([]);
        setRemovedImageIds(new Set());
        setPendingFiles([]);
        setDraftVariants([]);
        setVariantsList([]);
        setVariantGroups([]);
        setError(null);
    }

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
            resetFormState();
            setLoading(false);
            return;
        }
        if (mode === "create") {
            resetFormState();
            return;
        }
        if (mode === "edit" && productId) {
            setError(null);
            setLoading(true);
            void (async () => {
                try {
                    const p: SellerProductDetail = await sellerDashboardApi.getMyProduct(productId);
                    const d = p.dimensions;
                    const variants = p.variants ?? [];
                    setVariantsList(variants);
                    setVariantGroups(variantGroupsFromRows(variants));
                    setDraftVariants(draftRowsFromVariants(variants));
                    setForm({
                        title: p.title,
                        description: p.description ?? "",
                        price: String(p.price),
                        compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
                        costPrice: p.costPrice != null ? String(p.costPrice) : "",
                        categoryIds: p.categoryIds ?? [],
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
                        metaKeywords: p.metaKeywords ?? [],
                        status: p.status || "DRAFT",
                    });
                    setExistingImages(p.images);
                    setRemovedImageIds(new Set());
                    setPendingFiles([]);
                } catch (e) {
                    setError(
                        e instanceof HttpError
                            ? e.message
                            : t("sellerDashboard.productForm.loadError", "Không tải được sản phẩm."),
                    );
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [open, mode, productId, t]);

    const visibleExisting = useMemo(
        () => existingImages.filter((im) => !removedImageIds.has(im.id)),
        [existingImages, removedImageIds],
    );

    async function handleSubmit() {
        setError(null);
        const title = form.title.trim();
        const price = parsePrice(form.price);
        if (!title) {
            setError(t("sellerDashboard.productForm.errNameRequired", "Vui lòng nhập tên sản phẩm."));
            return;
        }
        if (price === undefined) {
            setError(t("sellerDashboard.productForm.errPriceInvalid", "Giá không hợp lệ."));
            return;
        }

        if (!dimensionInputsValid(form.dimLength, form.dimWidth, form.dimHeight)) {
            setError(
                t(
                    "sellerDashboard.productForm.errDimInvalid",
                    "Kích thước (dài / rộng / cao) không hợp lệ.",
                ),
            );
            return;
        }

        const description = form.description.trim();
        const compareRaw = parsePrice(form.compareAtPrice);
        if (form.compareAtPrice.trim() !== "" && compareRaw === undefined) {
            setError(t("sellerDashboard.productForm.errComparePriceInvalid", "Giá so sánh không hợp lệ."));
            return;
        }

        const costParsed = parseOptionalFieldNumber(form.costPrice);
        if (!costParsed.ok) {
            setError(t("sellerDashboard.productForm.errCostPriceInvalid", "Giá vốn không hợp lệ."));
            return;
        }

        const weightParsed = parseOptionalFieldNumber(form.weight);
        if (!weightParsed.ok) {
            setError(t("sellerDashboard.productForm.errWeightInvalid", "Trọng lượng không hợp lệ."));
            return;
        }

        const categoryIds = [...new Set(form.categoryIds)];
        const stockQuantity = parseIntSafe(form.stockQuantity, 0);
        const lowStockThreshold = parseIntSafe(form.lowStockThreshold, 10);
        const skuTrim = form.sku.trim();
        const sku = skuTrim || undefined;

        const dimensions = buildDimensions(form.dimLength, form.dimWidth, form.dimHeight);
        const metaKeywordsArr = normalizeKeywordList(form.metaKeywords);
        const metaTitleTrim = form.metaTitle.trim();
        const metaDescTrim = form.metaDescription.trim();
        const finalImageCount = visibleExisting.length + pendingFiles.length;
        const targetStatus = mode === "edit" ? form.status : "DRAFT";

        if (targetStatus === "ACTIVE") {
            if (!description) {
                setError(
                    t(
                        "sellerDashboard.productForm.errActiveNeedsDescription",
                        "Sản phẩm đang đăng bán cần có mô tả.",
                    ),
                );
                return;
            }
            if (finalImageCount <= 0) {
                setError(
                    t(
                        "sellerDashboard.productForm.errActiveNeedsImage",
                        "Sản phẩm đang đăng bán cần có ít nhất một ảnh.",
                    ),
                );
                return;
            }
        }

        for (const d of draftVariants) {
            if (d.price.trim() !== "" && parsePrice(d.price) === undefined) {
                setError(t("sellerDashboard.productForm.errVariantPriceInvalid", "Giá biến thể không hợp lệ."));
                return;
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
                const variantBodies = buildVariantBodies(draftVariants);
                await sellerDashboardApi.createProduct({
                    title,
                    description: description || undefined,
                    price,
                    ...(compareRaw !== undefined ? { compareAtPrice: compareRaw } : {}),
                    ...(costParsed.value != null ? { costPrice: costParsed.value } : {}),
                    ...(categoryIds.length > 0 ? { categoryIds } : {}),
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
                    compareAtPrice: form.compareAtPrice.trim() === "" ? null : (compareRaw ?? null),
                    costPrice: costParsed.value,
                    categoryIds,
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

                await replaceExistingVariants(productId, draftVariants);
            }
            onSuccess();
            onClose();
        } catch (e) {
            const msg =
                e instanceof HttpError
                    ? e.message
                    : t("sellerDashboard.productForm.errSaveFailed", "Không lưu được. Thử lại sau.");
            setError(msg);
        } finally {
            setSaving(false);
        }
    }

    function addVariantGroup() {
        setVariantGroups((prev) => [
            ...prev,
            { id: `group-${Math.random().toString(36).slice(2)}`, name: "", values: [] },
        ]);
    }

    function updateVariantGroup(id: string, patch: Partial<VariantGroup>) {
        setVariantGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    }

    function removeVariantGroup(id: string) {
        setVariantGroups((prev) => prev.filter((g) => g.id !== id));
    }

    function loadVariantRows(mode: VariantLoadMode) {
        const validGroups = normalizeVariantGroups(variantGroups);
        if (!validGroups.length) {
            setError(t("sellerDashboard.productForm.variantNoGroupsHint", "Add at least one variant name."));
            return;
        }
        const hasEmptyValues = validGroups.some((g) => g.values.length === 0);
        if (hasEmptyValues) {
            setError(t("sellerDashboard.productForm.errVariantValuesRequired", "At least one value is required for each option."));
            return;
        }
        if (hasDuplicateVariantGroupNames(validGroups)) {
            setError(t("sellerDashboard.productForm.errVariantDuplicateName", "Variant names must be unique."));
            return;
        }
        const rows = buildVariantMatrixRowsDynamic(validGroups, draftVariants, mode);
        if (rows.length > 200) {
            setError(t("sellerDashboard.productForm.errVariantTooManyCombinations", "Too many combinations. Please reduce variant values."));
            return;
        }
        setError(null);
        setDraftVariants(rows);
    }

    function buildVariantBodies(rows: DraftVariantRow[]) {
        return rows.map((row) => ({
            name: variantOptionMapDisplay(row.optionMap),
            sku: undefined,
            price: row.price.trim() === "" ? undefined : parsePrice(row.price),
            stockQuantity: parseIntSafe(row.stock, 0),
            options: row.optionMap,
            isActive: row.isActive,
        }));
    }

    async function replaceExistingVariants(productIdValue: string, rows: DraftVariantRow[]) {
        for (const existing of variantsList) {
            await sellerDashboardApi.deleteProductVariant(productIdValue, existing.id);
        }
        const recreatedRows: SellerProductVariantRow[] = [];
        for (const body of buildVariantBodies(rows)) {
            const created = await sellerDashboardApi.createProductVariant(productIdValue, body);
            recreatedRows.push(created);
        }
        setVariantsList(recreatedRows);
    }

    return {
        t,
        categories,
        form,
        setForm,
        existingImages,
        removedImageIds,
        setRemovedImageIds,
        pendingFiles,
        setPendingFiles,
        loading,
        saving,
        error,
        draftVariants,
        setDraftVariants,
        handleSubmit,
        visibleExisting,
        variantGroups,
        addVariantGroup,
        updateVariantGroup,
        removeVariantGroup,
        loadModeOpen,
        setLoadModeOpen,
        loadVariantRows,
        PRODUCT_STATUS_OPTIONS,
    };
}
