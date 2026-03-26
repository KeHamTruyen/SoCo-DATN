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
    ] as { value: SellerShopStatusFilter; label: string }[];
}

type ShopSort = "newest" | "priceAsc" | "priceDesc" | "title";

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
        } else {
            sorted.sort((a, b) => {
                const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
                const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
                return tb - ta;
            });
        }
        return sorted;
    }, [items, search, sort]);

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

    async function handleArchive(p: SellerProductRow) {
        const ok = window.confirm(
            t("sellerDashboard.shop.archiveConfirm", 'Lưu trữ sản phẩm "{{title}}"? Sản phẩm sẽ chuyển sang trạng thái lưu trữ.', { title: p.title }),
        );
        if (!ok) return;
        setActionError(null);
        setBusyProductId(p.id);
        try {
            await sellerDashboardApi.deleteProduct(p.id);
            onProductsUpdated();
        } catch (e) {
            setActionError(
                e instanceof HttpError ? e.message : t("sellerDashboard.shop.archiveError", "Không lưu trữ được."),
            );
        } finally {
            setBusyProductId(null);
        }
    }

    async function handlePublish(p: SellerProductRow) {
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
                        onArchiveProduct={handleArchive}
                        onPublishProduct={handlePublish}
                        busyProductId={busyProductId}
                    />
                )}
            </div>

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
