import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { SellerProductRow } from "../types/sellerDashboard.types";
import { formatSellerProductStatus } from "../sellerProductLabels";
import { cn } from "../../../shared/lib/cn";

interface SellerDashboardProductTableProps {
    mode: "shop" | "inventory";
    items: SellerProductRow[];
    loading: boolean;
    onAdjustStock?: (product: SellerProductRow) => void;
    /** My Shop — CRUD actions */
    onEditProduct?: (product: SellerProductRow) => void;
    onArchiveProduct?: (product: SellerProductRow) => void;
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
            <table className="w-full min-w-180 text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80">
                    <tr>
                        <th className="px-4 py-3 font-semibold">{t("sellerDashboard.shop.productName", "Sản phẩm")}</th>
                        <th className="px-4 py-3 font-semibold">{t("sellerDashboard.shop.price", "Giá")}</th>
                        <th className="px-4 py-3 font-semibold">{t("sellerDashboard.shop.status", "Trạng thái")}</th>
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
                                <th className="px-4 py-3 font-semibold">{t("sellerDashboard.shop.stock", "Tồn kho")}</th>
                                <th className="px-4 py-3 font-semibold">{t("sellerDashboard.shop.lowThreshold", "Ngưỡng cảnh báo")}</th>
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
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                            {p.primaryImageUrl ? (
                                                <img
                                                    src={p.primaryImageUrl}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                                {p.title}
                                            </p>
                                            {p.categoryName ? (
                                                <p className="text-xs text-neutral-500">
                                                    {p.categoryName}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-semibold">
                                    {p.price.toLocaleString("vi-VN")} đ
                                </td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
                                        {formatSellerProductStatus(p.status)}
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
                                        <td className="px-4 py-3">
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
                                                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                                    ({t("sellerDashboard.shop.low", "thấp")})
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums text-neutral-600 dark:text-neutral-400">
                                            {p.lowStockThreshold}
                                        </td>
                                    </>
                                )}
                                <td className="px-4 py-3 text-right">
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <Link
                                            to={`/products/${p.id}`}
                                            className="text-sm font-semibold text-primary hover:underline"
                                        >
                                            {t("sellerDashboard.shop.viewShop", "Xem shop")}
                                        </Link>
                                        {mode === "shop" && onEditProduct ? (
                                            <button
                                                type="button"
                                                disabled={busyProductId === p.id}
                                                onClick={() => onEditProduct(p)}
                                                className="text-sm font-semibold text-neutral-700 hover:underline disabled:opacity-50 dark:text-neutral-300"
                                            >
                                                {t("common.edit", "Sửa")}
                                            </button>
                                        ) : null}
                                        {mode === "shop" &&
                                        p.status !== "ARCHIVED" &&
                                        onArchiveProduct ? (
                                            <button
                                                type="button"
                                                disabled={busyProductId === p.id}
                                                onClick={() => onArchiveProduct(p)}
                                                className="text-sm font-semibold text-neutral-600 hover:underline disabled:opacity-50 dark:text-neutral-400"
                                            >
                                                {t("sellerDashboard.shop.archive", "Lưu trữ")}
                                            </button>
                                        ) : null}
                                        {mode === "shop" &&
                                        p.status === "DRAFT" &&
                                        onPublishProduct ? (
                                            <button
                                                type="button"
                                                disabled={busyProductId === p.id}
                                                onClick={() => onPublishProduct(p)}
                                                className="text-sm font-semibold text-emerald-700 hover:underline disabled:opacity-50 dark:text-emerald-400"
                                            >
                                                {t("sellerDashboard.shop.publish", "Đăng bán")}
                                            </button>
                                        ) : null}
                                        {mode === "inventory" && onAdjustStock ? (
                                            <button
                                                type="button"
                                                onClick={() => onAdjustStock(p)}
                                                className="text-sm font-semibold text-neutral-700 hover:underline dark:text-neutral-300"
                                            >
                                                {t("sellerDashboard.shop.adjustStock", "Sửa tồn")}
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
