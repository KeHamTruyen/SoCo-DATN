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
    buildDimensions,
    dimensionInputsValid,
    emptyForm,
    parseCommaKeywords,
    parseIntSafe,
    parseOptionsJson,
    parseOptionalFieldNumber,
    parsePrice,
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
                    const p: SellerProductDetail = await sellerDashboardApi.getMyProduct(productId);
                    const d = p.dimensions;
                    setVariantsList(p.variants ?? []);
                    setForm({
                        title: p.title,
                        description: p.description ?? "",
                        price: String(p.price),
                        compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
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
                setError(t("sellerDashboard.productForm.errVariantPriceInvalid", "Giá biến thể không hợp lệ."));
                return;
            }
            const oj = d.optionsJson.trim();
            if (oj) {
                try {
                    JSON.parse(oj);
                } catch {
                    setError(
                        t(
                            "sellerDashboard.productForm.errVariantOptionsInvalid",
                            "Options JSON của biến thể không hợp lệ.",
                        ),
                    );
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
                    compareAtPrice: form.compareAtPrice.trim() === "" ? null : (compareRaw ?? null),
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
                    : t("sellerDashboard.productForm.errSaveFailed", "Không lưu được. Thử lại sau.");
            setError(msg);
        } finally {
            setSaving(false);
        }
    }

    async function handleAddVariantEdit() {
        if (!productId || mode !== "edit") return;
        const name = newVariant.name.trim();
        if (!name) {
            setError(t("sellerDashboard.productForm.errVariantNameRequired", "Nhập tên biến thể."));
            return;
        }
        const pr = parsePrice(newVariant.price);
        if (newVariant.price.trim() !== "" && pr === undefined) {
            setError(t("sellerDashboard.productForm.errVariantPriceInvalid", "Giá biến thể không hợp lệ."));
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
                e instanceof HttpError
                    ? e.message
                    : t("sellerDashboard.productForm.errAddVariantFailed", "Không thêm được biến thể."),
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteVariant(variantId: string) {
        if (!productId) return;
        if (!window.confirm(t("sellerDashboard.productForm.confirmDeleteVariant", "Xóa biến thể này?"))) return;
        setSaving(true);
        setError(null);
        try {
            await sellerDashboardApi.deleteProductVariant(productId, variantId);
            setVariantsList((v) => v.filter((x) => x.id !== variantId));
        } catch (e) {
            setError(
                e instanceof HttpError
                    ? e.message
                    : t("sellerDashboard.productForm.errDeleteVariantFailed", "Không xóa được biến thể."),
            );
        } finally {
            setSaving(false);
        }
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
        variantsList,
        newVariant,
        setNewVariant,
        handleSubmit,
        handleAddVariantEdit,
        handleDeleteVariant,
        visibleExisting,
        PRODUCT_STATUS_OPTIONS,
    };
}
