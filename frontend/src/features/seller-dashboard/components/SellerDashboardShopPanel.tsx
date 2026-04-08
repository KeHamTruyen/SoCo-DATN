import { PackagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { sellerDashboardApi } from "../api/sellerDashboardApi";
import type {
    SellerProductRow,
    SellerShopStatusFilter,
} from "../types/sellerDashboard.types";
import { cn } from "../../../shared/lib/cn";
import { HttpError } from "../../../shared/api/httpClient";
import { Button, Card, Separator } from "../../../shared/ui";
import { SellerDashboardProductTable } from "./SellerDashboardProductTable";
import { SellerProductFormDialog } from "./SellerProductFormDialog";

function useStatusFilters() {
    const { t } = useTranslation();
    return [
        { value: "", label: t("sellerDashboard.shop.filterAll", "Tất cả") },
        { value: "ACTIVE", label: t("sellerDashboard.shop.filterActive", "Đang bán") },
        { value: "DRAFT", label: t("sellerDashboard.shop.filterDraft", "Bản nháp") },
        { value: "OUT_OF_STOCK", label: t("sellerDashboard.shop.filterOutOfStock", "Hết hàng") },
        { value: "ARCHIVED", label: t("sellerDashboard.shop.filterArchived", "Lưu trữ") },
        { value: "DELETED", label: t("sellerDashboard.shop.filterDeleted", "Đã xóa") },
    ] as { value: SellerShopStatusFilter; label: string }[];
}

type ShopSort = "newest" | "priceAsc" | "priceDesc" | "title";
type ConfirmActionType = "archive" | "unarchive" | "publish" | "delete";

interface SellerDashboardShopPanelProps {
    items: SellerProductRow[];
    loading: boolean;
    statusFilter: SellerShopStatusFilter;
    onStatusFilterChange: (next: SellerShopStatusFilter) => void;
    onProductsUpdated: () => void;
}

export function SellerDashboardShopPanel({
    items,
    loading,
    statusFilter,
    onStatusFilterChange,
    onProductsUpdated,
}: SellerDashboardShopPanelProps) {
    const { t } = useTranslation();
    const STATUS_FILTERS = useStatusFilters();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<ShopSort>("newest");
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editProductId, setEditProductId] = useState<string | null>(null);
    const [busyProductId, setBusyProductId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        action: ConfirmActionType | null;
        product: SellerProductRow | null;
    }>({ open: false, action: null, product: null });
    const STATUS_PRIORITY: Record<string, number> = {
        ACTIVE: 0,
        DRAFT: 1,
        OUT_OF_STOCK: 2,
        ARCHIVED: 3,
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        let list = items;
        if (q) {
            list = list.filter((p) => p.title.toLowerCase().includes(q));
        }
        const sorted = [...list];
        if (sort === "priceAsc") {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sort === "priceDesc") {
            sorted.sort((a, b) => b.price - a.price);
        } else if (sort === "title") {
            sorted.sort((a, b) => a.title.localeCompare(b.title, "vi"));
        } else if (statusFilter === "") {
            sorted.sort((a, b) => {
                const pa = STATUS_PRIORITY[a.status] ?? 99;
                const pb = STATUS_PRIORITY[b.status] ?? 99;
                if (pa !== pb) return pa - pb;
                const ta = Date.parse(a.updatedAt ?? a.createdAt ?? "") || 0;
                const tb = Date.parse(b.updatedAt ?? b.createdAt ?? "") || 0;
                return tb - ta;
            });
        } else {
            sorted.sort((a, b) => {
                const ta = Date.parse(a.updatedAt ?? a.createdAt ?? "") || 0;
                const tb = Date.parse(b.updatedAt ?? b.createdAt ?? "") || 0;
                return tb - ta;
            });
        }
        return sorted;
    }, [items, search, sort, statusFilter]);

    function openCreate() {
        setFormMode("create");
        setEditProductId(null);
        setFormOpen(true);
    }

    function openEdit(p: SellerProductRow) {
        setFormMode("edit");
        setEditProductId(p.id);
        setFormOpen(true);
    }

    function openConfirm(action: ConfirmActionType, product: SellerProductRow) {
        setConfirmState({ open: true, action, product });
    }

    function closeConfirm() {
        setConfirmState({ open: false, action: null, product: null });
    }

    async function runArchive(p: SellerProductRow) {
        setActionError(null);
        setBusyProductId(p.id);
        try {
            await sellerDashboardApi.updateSellerProduct(p.id, { status: "ARCHIVED" });
            onProductsUpdated();
        } catch (e) {
            setActionError(
                e instanceof HttpError ? e.message : t("sellerDashboard.shop.archiveError", "Không lưu trữ được."),
            );
        } finally {
            setBusyProductId(null);
        }
    }

    async function runDelete(p: SellerProductRow) {
        setActionError(null);
        setBusyProductId(p.id);
        try {
            await sellerDashboardApi.deleteProduct(p.id);
            onProductsUpdated();
        } catch (e) {
            setActionError(
                e instanceof HttpError
                    ? e.message
                    : t("sellerDashboard.shop.deleteError", "Không xóa được sản phẩm."),
            );
        } finally {
            setBusyProductId(null);
        }
    }

    async function handleRestore(p: SellerProductRow) {
        const ok = window.confirm(
            t("sellerDashboard.shop.restoreConfirm", 'Khôi phục sản phẩm "{{title}}"?', {
                title: p.title,
            }),
        );
        if (!ok) return;
        setActionError(null);
        setBusyProductId(p.id);
        try {
            await sellerDashboardApi.restoreProduct(p.id);
            onProductsUpdated();
        } catch (e) {
            setActionError(
                e instanceof HttpError
                    ? e.message
                    : t("sellerDashboard.shop.restoreError", "Không khôi phục được sản phẩm."),
            );
        } finally {
            setBusyProductId(null);
        }
    }

    async function runPublish(p: SellerProductRow) {
        setActionError(null);
        setBusyProductId(p.id);
        try {
            await sellerDashboardApi.publishProduct(p.id);
            onProductsUpdated();
        } catch (e) {
            setActionError(
                e instanceof HttpError
                    ? e.message
                    : t("sellerDashboard.shop.publishError", "Không đăng bán được. Cần ít nhất một ảnh và mô tả."),
            );
        } finally {
            setBusyProductId(null);
        }
    }

    async function runUnarchive(p: SellerProductRow) {
        setActionError(null);
        setBusyProductId(p.id);
        try {
            await sellerDashboardApi.updateSellerProduct(p.id, { status: "DRAFT" });
            onProductsUpdated();
        } catch (e) {
            setActionError(
                e instanceof HttpError
                    ? e.message
                    : t("sellerDashboard.shop.unarchiveError", "Không bỏ lưu trữ được."),
            );
        } finally {
            setBusyProductId(null);
        }
    }

    async function onConfirmAction() {
        if (!confirmState.product || !confirmState.action) return;
        const target = confirmState.product;
        const action = confirmState.action;
        closeConfirm();
        if (action === "archive") await runArchive(target);
        if (action === "unarchive") await runUnarchive(target);
        if (action === "publish") await runPublish(target);
        if (action === "delete") await runDelete(target);
    }

    const confirmMessage =
        confirmState.action === "archive"
            ? t("sellerDashboard.shop.archiveConfirm", 'Lưu trữ sản phẩm "{{title}}"? Sản phẩm sẽ chuyển sang trạng thái lưu trữ.', { title: confirmState.product?.title ?? "" })
            : confirmState.action === "unarchive"
              ? t("sellerDashboard.shop.unarchiveConfirm", 'Bỏ lưu trữ sản phẩm "{{title}}"?', { title: confirmState.product?.title ?? "" })
              : confirmState.action === "publish"
                ? t("sellerDashboard.shop.publishConfirm", 'Đăng bán sản phẩm "{{title}}"?', { title: confirmState.product?.title ?? "" })
                : t(
                      "sellerDashboard.shop.deleteConfirm",
                      'Xóa sản phẩm "{{title}}"? Sản phẩm sẽ bị ẩn ngay và có thể khôi phục trong 180 ngày.',
                      { title: confirmState.product?.title ?? "" },
                  );

    const statusLabel =
        STATUS_FILTERS.find((x) => x.value === statusFilter)?.label ?? t("sellerDashboard.shop.filterAll", "Tất cả");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        {t("sellerDashboard.shop.title", "My Shop")}
                    </h2>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {t("sellerDashboard.shop.description", "Quản lý sản phẩm hiển thị với khách: lọc theo trạng thái, tìm nhanh và xem lượt xem / đơn đã bán (theo dữ liệu shop).")}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="w-full shrink-0 sm:w-auto"
                    onClick={openCreate}
                >
                    <PackagePlus className="h-4 w-4" aria-hidden />
                    {t("sellerDashboard.shop.addProduct", "Thêm sản phẩm")}
                </Button>
            </div>

            {actionError ? (
                <p
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    {actionError}
                </p>
            ) : null}

            <Card className="p-4 sm:p-5">
                <div className="space-y-4">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("sellerDashboard.shop.status", "Trạng thái")}
                        </p>
                        <div
                            className="no-scrollbar flex flex-wrap gap-2"
                            role="group"
                            aria-label={t("sellerDashboard.shop.filterStatusLabel", "Lọc trạng thái sản phẩm")}
                        >
                            {STATUS_FILTERS.map((f) => (
                                <button
                                    key={f.value || "all"}
                                    type="button"
                                    onClick={() => onStatusFilterChange(f.value)}
                                    className={cn(
                                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                                        statusFilter === f.value
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-muted/50 text-muted-foreground hover:border-primary/40 hover:bg-muted",
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {t("sellerDashboard.shop.filterNotice", "Lọc trên máy chủ. Tìm kiếm và sắp xếp chỉ áp dụng trên danh sách đã tải.")}
                        </p>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(11rem,14rem)] lg:items-end">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="seller-shop-search"
                                className="text-xs font-medium text-muted-foreground"
                            >
                                {t("sellerDashboard.shop.searchName", "Tìm theo tên")}
                            </label>
                            <input
                                id="seller-shop-search"
                                type="search"
                                placeholder={t("sellerDashboard.shop.searchPlaceholder", "Nhập tên sản phẩm…")}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label
                                htmlFor="seller-shop-sort"
                                className="text-xs font-medium text-muted-foreground"
                            >
                                {t("sellerDashboard.shop.sort", "Sắp xếp")}
                            </label>
                            <select
                                id="seller-shop-sort"
                                value={sort}
                                onChange={(e) =>
                                    setSort(e.target.value as ShopSort)
                                }
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                            >
                                <option value="newest">{t("sellerDashboard.shop.sortNewest", "Mới nhất")}</option>
                                <option value="priceAsc">{t("sellerDashboard.shop.sortPriceAsc", "Giá tăng dần")}</option>
                                <option value="priceDesc">{t("sellerDashboard.shop.sortPriceDesc", "Giá giảm dần")}</option>
                                <option value="title">{t("sellerDashboard.shop.sortTitle", "Tên A–Z")}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                        {t("sellerDashboard.shop.productList", "Danh sách sản phẩm")}
                    </h3>
                    {!loading && items.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                            {t("sellerDashboard.shop.showing", "Hiển thị")}{" "}
                            <span className="font-medium text-foreground tabular-nums">
                                {filtered.length}
                            </span>{" "}
                            /{" "}
                            <span className="tabular-nums">{items.length}</span> · {t("sellerDashboard.shop.apiFilter", "Lọc API")}: {statusLabel}
                            {items.length >= 100 ? ` · ${t("sellerDashboard.shop.maxLoad", "Tối đa 100 mỗi lần tải")}` : ""}
                        </p>
                    ) : null}
                </div>

                {!loading && items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center text-sm text-muted-foreground">
                        {t("sellerDashboard.shop.emptyList", "Chưa có sản phẩm. Dùng “Thêm sản phẩm”, sau đó đăng bán khi đã có ảnh và mô tả.")}
                    </div>
                ) : (
                    <SellerDashboardProductTable
                        mode="shop"
                        items={filtered}
                        loading={loading}
                        onEditProduct={openEdit}
                        onArchiveProduct={(p) => openConfirm("archive", p)}
                        onDeleteProduct={(p) => openConfirm("delete", p)}
                        onUnarchiveProduct={(p) => openConfirm("unarchive", p)}
                        onRestoreProduct={handleRestore}
                        onPublishProduct={(p) => openConfirm("publish", p)}
                        busyProductId={busyProductId}
                    />
                )}
            </div>

            {confirmState.open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/50"
                        aria-label={t("auth.closeModal", "Đóng")}
                        onClick={closeConfirm}
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="shop-confirm-title"
                        className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
                    >
                        <h3 id="shop-confirm-title" className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                            {t("sellerDashboard.shop.confirmTitle", "Xác nhận thao tác")}
                        </h3>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{confirmMessage}</p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeConfirm}
                                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            >
                                {t("auth.cancel", "Hủy")}
                            </button>
                            <button
                                type="button"
                                onClick={() => void onConfirmAction()}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                            >
                                {t("sellerDashboard.shop.confirmAction", "Xác nhận")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <SellerProductFormDialog
                open={formOpen}
                mode={formMode}
                productId={editProductId}
                onClose={() => {
                    setFormOpen(false);
                    setEditProductId(null);
                }}
                onSuccess={() => {
                    onProductsUpdated();
                    setActionError(null);
                }}
            />
        </div>
    );
}
