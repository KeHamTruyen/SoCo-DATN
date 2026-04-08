import { cn } from "../../../shared/lib/cn";
import { useSellerProductForm, type SellerProductFormMode } from "../hooks/useSellerProductForm";
import {
    SellerProductFormBasicSection,
    SellerProductFormEditStatusSection,
    SellerProductFormImagesSection,
    SellerProductFormInventorySection,
    SellerProductFormPriceCategorySection,
    SellerProductFormSeoSection,
    SellerProductFormShippingSection,
    SellerProductFormVariantsSection,
} from "./seller-product-form/SellerProductFormSections";

export type { SellerProductFormMode };

interface SellerProductFormDialogProps {
    open: boolean;
    mode: SellerProductFormMode;
    productId: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function SellerProductFormDialog({
    open,
    mode,
    productId,
    onClose,
    onSuccess,
}: SellerProductFormDialogProps) {
    const formApi = useSellerProductForm(open, mode, productId, onClose, onSuccess);
    const {
        t,
        categories,
        form,
        setForm,
        removedImageIds,
        setRemovedImageIds,
        pendingFiles,
        setPendingFiles,
        loading,
        saving,
        error,
        draftVariants,
        setDraftVariants,
        variantGroups,
        addVariantGroup,
        updateVariantGroup,
        removeVariantGroup,
        loadModeOpen,
        setLoadModeOpen,
        loadVariantRows,
        handleSubmit,
        visibleExisting,
        PRODUCT_STATUS_OPTIONS,
    } = formApi;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
            <button
                type="button"
                className="absolute inset-0 bg-black/50"
                aria-label={t("sellerDashboard.productForm.close", "Đóng")}
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
                    {mode === "create"
                        ? t("sellerDashboard.productForm.titleCreate", "Thêm sản phẩm")
                        : t("sellerDashboard.productForm.titleEdit", "Sửa sản phẩm")}
                </h2>

                {loading ? (
                    <div className="mt-6 space-y-3">
                        <div className="h-10 animate-pulse rounded-lg bg-muted" />
                        <div className="h-24 animate-pulse rounded-lg bg-muted" />
                    </div>
                ) : (
                    <div className="mt-4 space-y-6">
                        <SellerProductFormBasicSection form={form} setForm={setForm} saving={saving} t={t} />
                        <SellerProductFormPriceCategorySection
                            form={form}
                            setForm={setForm}
                            saving={saving}
                            categories={categories}
                            t={t}
                        />
                        <SellerProductFormInventorySection form={form} setForm={setForm} saving={saving} t={t} />
                        <SellerProductFormShippingSection form={form} setForm={setForm} saving={saving} t={t} />
                        <SellerProductFormSeoSection form={form} setForm={setForm} saving={saving} t={t} />
                        <SellerProductFormVariantsSection
                            draftVariants={draftVariants}
                            setDraftVariants={setDraftVariants}
                            variantGroups={variantGroups}
                            onAddVariantGroup={addVariantGroup}
                            onUpdateVariantGroup={updateVariantGroup}
                            onRemoveVariantGroup={removeVariantGroup}
                            loadModeOpen={loadModeOpen}
                            setLoadModeOpen={setLoadModeOpen}
                            onLoadVariantRows={loadVariantRows}
                            saving={saving}
                            t={t}
                        />
                        {mode === "edit" ? (
                            <SellerProductFormEditStatusSection
                                form={form}
                                setForm={setForm}
                                saving={saving}
                                t={t}
                                productStatusOptions={PRODUCT_STATUS_OPTIONS}
                            />
                        ) : null}
                        <SellerProductFormImagesSection
                            mode={mode}
                            visibleExisting={visibleExisting}
                            pendingFiles={pendingFiles}
                            saving={saving}
                            t={t}
                            setRemovedImageIds={setRemovedImageIds}
                            setPendingFiles={setPendingFiles}
                        />
                    </div>
                )}

                {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className={cn(
                            "rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50",
                        )}
                    >
                        {t("common.cancel", "Hủy")}
                    </button>
                    <button
                        type="button"
                        disabled={saving || loading}
                        onClick={() => void handleSubmit()}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                        {saving ? t("common.saving", "Đang lưu…") : t("common.save", "Lưu")}
                    </button>
                </div>
            </div>
        </div>
    );
}
