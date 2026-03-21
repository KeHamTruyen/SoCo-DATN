import { Link } from "react-router-dom";
import type { SellerProductRow } from "../types/sellerDashboard.types";
import { cn } from "../../../shared/lib/cn";

interface SellerDashboardProductsPanelProps {
    items: SellerProductRow[];
    loading: boolean;
    variant: "shop" | "inventory";
}

export function SellerDashboardProductsPanel({
    items,
    loading,
    variant,
}: SellerDashboardProductsPanelProps) {
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
                Chưa có sản phẩm. Thêm sản phẩm từ form (sắp có) hoặc qua API.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Sản phẩm</th>
                        <th className="px-4 py-3 font-semibold">Giá</th>
                        <th className="px-4 py-3 font-semibold">Trạng thái</th>
                        {variant === "inventory" && (
                            <th className="px-4 py-3 font-semibold">Tồn kho</th>
                        )}
                        <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
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
                                                <p className="text-xs text-neutral-500">{p.categoryName}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-semibold">
                                    {p.price.toLocaleString("vi-VN")} đ
                                </td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
                                        {p.status}
                                    </span>
                                </td>
                                {variant === "inventory" && (
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                "font-semibold",
                                                low ? "text-amber-600 dark:text-amber-400" : "",
                                            )}
                                        >
                                            {p.stockQuantity}
                                        </span>
                                        {low ? (
                                            <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                                (thấp)
                                            </span>
                                        ) : null}
                                    </td>
                                )}
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        to={`/products/${p.id}`}
                                        className="text-sm font-semibold text-primary hover:underline"
                                    >
                                        Xem
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
