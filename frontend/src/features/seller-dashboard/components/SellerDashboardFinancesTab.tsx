import type { SellerStats } from "../../profile/types/profile.types";

interface SellerDashboardFinancesTabProps {
    stats: SellerStats;
}

export function SellerDashboardFinancesTab({ stats }: SellerDashboardFinancesTabProps) {
    const rows: { label: string; value: string; hint?: string }[] = [
        {
            label: "Doanh thu tháng này (ước tính từ đơn)",
            value: `${stats.monthlySales.toLocaleString("vi-VN")} đ`,
        },
        {
            label: "Tăng trưởng doanh thu (tháng)",
            value: `${stats.monthlySalesGrowth >= 0 ? "+" : ""}${stats.monthlySalesGrowth.toLocaleString("vi-VN")}%`,
        },
        {
            label: "Đơn mới",
            value: String(stats.newOrders),
        },
        {
            label: "Đơn chờ xử lý",
            value: String(stats.pendingOrders),
        },
    ];

    return (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-lg font-bold">Finances</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-950/50"
                    >
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {row.label}
                        </dt>
                        <dd className="mt-1 text-base font-bold text-neutral-900 dark:text-neutral-100">
                            {row.value}
                        </dd>
                    </div>
                ))}
            </dl>
            <div className="rounded-lg border border-dashed border-neutral-200 p-3 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                <p className="font-medium text-neutral-600 dark:text-neutral-300">
                    Lượt xem sản phẩm
                </p>
                <p className="mt-1">
                    Tổng:{" "}
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {stats.productViews.toLocaleString("vi-VN")}
                    </span>{" "}
                    · Hôm nay:{" "}
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {stats.productViewsToday.toLocaleString("vi-VN")}
                    </span>
                </p>
                <p className="mt-3">
                    Báo cáo chi tiết, đối soát và rút tiền có thể bổ sung ở phiên
                    bản sau.
                </p>
            </div>
        </div>
    );
}
