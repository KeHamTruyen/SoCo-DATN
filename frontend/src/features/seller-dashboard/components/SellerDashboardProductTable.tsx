import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { SellerProductRow } from "../types/sellerDashboard.types";
import { cn } from "../../../shared/lib/cn";

interface SellerDashboardProductTableProps {
    mode: "shop" | "inventory";
    items: SellerProductRow[];
    loading: boolean;
    onAdjustStock?: (product: SellerProductRow) => void;
    /** My Shop — CRUD actions */
    onEditProduct?: (product: SellerProductRow) => void;
    onArchiveProduct?: (product: SellerProductRow) => void;
    onDeleteProduct?: (product: SellerProductRow) => void;
    onUnarchiveProduct?: (product: SellerProductRow) => void;
    onRestoreProduct?: (product: SellerProductRow) => void;
    onPublishProduct?: (product: SellerProductRow) => void;
    busyProductId?: string | null;
}

export function SellerDashboardProductTable({
    mode,
    items,
    loading,
    onAdjustStock,
    onEditProduct,
    onArchiveProduct,
    onDeleteProduct,
    onUnarchiveProduct,
    onRestoreProduct,
    onPublishProduct,
    busyProductId,
}: SellerDashboardProductTableProps) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-20 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
                    />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-neutral-200 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                {mode === "shop"
                    ? t("sellerDashboard.shop.noProductsMatch", "Không có sản phẩm nào khớp tìm kiếm / sắp xếp trên trang hiện tại.")
                    : t("sellerDashboard.shop.noData", "Không có dữ liệu để hiển thị.")}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full min-w-225 text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80">
                    <tr>
                        <th className="px-4 py-3 font-semibold min-w-70 w-2/5">{t("sellerDashboard.shop.productName", "Sản phẩm")}</th>
                        <th className="px-4 py-3 font-semibold text-right">{t("sellerDashboard.shop.price", "Giá")}</th>
                        <th className="px-4 py-3 font-semibold text-center">{t("sellerDashboard.shop.status", "Trạng thái")}</th>
                        {mode === "shop" && (
                            <>
                                <th className="px-4 py-3 font-semibold text-right">
                                    {t("sellerDashboard.shop.views", "Lượt xem")}
                                </th>
                                <th className="px-4 py-3 font-semibold text-right">
                                    {t("sellerDashboard.shop.sold", "Đã bán")}
                                </th>
                            </>
                        )}
                        {mode === "inventory" && (
                            <>
                                <th className="px-4 py-3 font-semibold text-right">{t("sellerDashboard.shop.stock", "Tồn kho")}</th>
                                <th className="px-4 py-3 font-semibold text-right">{t("sellerDashboard.shop.lowThreshold", "Ngưỡng cảnh báo")}</th>
                            </>
                        )}
                        <th className="px-4 py-3 font-semibold text-right">{t("sellerDashboard.shop.actions", "Thao tác")}</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((p) => {
                        const low = p.stockQuantity <= p.lowStockThreshold;
                        return (
                            <tr
                                key={p.id}
                                className="border-b border-neutral-100 dark:border-neutral-800"
                            >
                                <td className="px-4 py-3">
                                    <Link 
                                        to={`/products/${p.id}`}
                                        className="group flex items-center gap-3 transition-opacity hover:opacity-90"
                                    >
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-transparent transition-all group-hover:ring-primary dark:bg-neutral-800">
                                            {p.primaryImageUrl ? (
                                                <img
                                                    src={p.primaryImageUrl}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-neutral-900 transition-colors group-hover:text-primary dark:text-neutral-100 line-clamp-2" title={p.title}>
                                                {p.title}
                                            </p>
                                            {p.categoryName ? (
                                                <p className="text-xs text-neutral-500">
                                                    {p.categoryName}
                                                </p>
                                            ) : null}
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-4 py-3 font-semibold text-right tabular-nums whitespace-nowrap">
                                    {p.price.toLocaleString("vi-VN")} đ
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium dark:bg-neutral-800 whitespace-nowrap">
                                        {t(`sellerDashboard.productForm.status${p.status === "OUT_OF_STOCK" ? "OutOfStock" : p.status.charAt(0) + p.status.slice(1).toLowerCase()}`, p.status)}
                                    </span>
                                </td>
                                {mode === "shop" && (
                                    <>
                                        <td className="px-4 py-3 text-right tabular-nums text-neutral-700 dark:text-neutral-300">
                                            {(p.viewsCount ?? 0).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-neutral-700 dark:text-neutral-300">
                                            {(p.salesCount ?? 0).toLocaleString("vi-VN")}
                                        </td>
                                    </>
                                )}
                                {mode === "inventory" && (
                                    <>
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={cn(
                                                    "font-semibold tabular-nums",
                                                    low
                                                        ? "text-amber-600 dark:text-amber-400"
                                                        : "text-neutral-900 dark:text-neutral-100",
                                                )}
                                            >
                                                {p.stockQuantity}
                                            </span>
                                            {low ? (
                                                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap">
                                                    ({t("sellerDashboard.shop.low", "thấp")})
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-neutral-600 dark:text-neutral-400">
                                            {p.lowStockThreshold}
                                        </td>
                                    </>
                                )}
                                <td className="px-4 py-3 text-right">
                                    <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                                        {mode === "shop" && onEditProduct ? (
                                            <button
                                                type="button"
                                                disabled={busyProductId === p.id}
                                                onClick={() => onEditProduct(p)}
                                                className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                            >
                                                {t("sellerDashboard.shop.editAction", "Edit")}
                                            </button>
                                        ) : null}
                                        {mode === "shop" && !p.deletedAt && p.status !== "ARCHIVED" && onArchiveProduct ? (
                                            <button
                                                type="button"
                                                disabled={busyProductId === p.id}
                                                onClick={() => onArchiveProduct(p)}
                                                className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-rose-400 dark:hover:border-rose-800 dark:hover:bg-rose-950/30"
                                            >
                                                {t("sellerDashboard.shop.archiveAction", "Lưu trữ")}
                                            </button>
                                        ) : null}
                                        {mode === "shop" && !p.deletedAt && p.status === "ARCHIVED" && onUnarchiveProduct ? (
                                            <button
                                                type="button"
                                                disabled={busyProductId === p.id}
                                                onClick={() => onUnarchiveProduct(p)}
                                                className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
                                            >
                                                {t("sellerDashboard.shop.unarchiveAction", "Bỏ lưu trữ")}
                                            </button>
                                        ) : null}
                                        {mode === "shop" &&
                                        !p.deletedAt &&
                                        p.status === "DRAFT" &&
                                        onPublishProduct ? (
                                            <button
                                                type="button"
                                                disabled={busyProductId === p.id}
                                                onClick={() => onPublishProduct(p)}
                                                className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                            >
                                                {t("sellerDashboard.shop.publishAction", "Đăng bán")}
                                            </button>
                                        ) : null}
                                        {mode === "shop" && !p.deletedAt && onDeleteProduct ? (
                                            <button
                                                type="button"
                                                disabled={busyProductId === p.id}
                                                onClick={() => onDeleteProduct(p)}
                                                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition-colors hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/40"
                                            >
                                                {t("sellerDashboard.shop.deleteAction", "Xóa")}
                                            </button>
                                        ) : null}
                                        {mode === "shop" && p.deletedAt && onRestoreProduct ? (
                                            <button
                                                type="button"
                                                disabled={busyProductId === p.id}
                                                onClick={() => onRestoreProduct(p)}
                                                className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
                                            >
                                                {t("sellerDashboard.shop.restoreAction", "Khôi phục")}
                                            </button>
                                        ) : null}
                                        {mode === "inventory" && onAdjustStock ? (
                                            <button
                                                type="button"
                                                onClick={() => onAdjustStock(p)}
                                                className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                            >
                                                {t("sellerDashboard.shop.adjustStockAction", "Kho")}
                                            </button>
                                        ) : null}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
