import type { SellerStats } from "../types/profile.types";

interface SellerDashboardStatsProps {
    stats: SellerStats;
}

export function SellerDashboardStats({ stats }: SellerDashboardStatsProps) {
    return (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-2 flex items-start justify-between">
                    <span className="text-sm font-medium text-neutral-500">Monthly Sales</span>
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                        +{stats.monthlySalesGrowth}%
                    </span>
                </div>
                <h4 className="text-2xl font-black">${stats.monthlySales.toLocaleString()}</h4>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className="h-full w-3/4 bg-primary" />
                </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-2 flex items-start justify-between">
                    <span className="text-sm font-medium text-neutral-500">New Orders</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        {stats.pendingOrders} pending
                    </span>
                </div>
                <h4 className="text-2xl font-black">{stats.newOrders.toLocaleString()}</h4>
                <div className="mt-4 flex h-8 items-end gap-1">
                    {[4, 6, 8, 5, 7, 8, 9].map((h, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-t ${i === 6 ? "bg-primary" : "bg-primary/20"}`}
                            style={{ height: `${h * 4}px` }}
                        />
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-2 flex items-start justify-between">
                    <span className="text-sm font-medium text-neutral-500">Product Views</span>
                    <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs font-bold text-info">
                        +{stats.productViewsToday} today
                    </span>
                </div>
                <h4 className="text-2xl font-black">
                    {stats.productViews >= 1000
                        ? `${(stats.productViews / 1000).toFixed(1)}k`
                        : stats.productViews}
                </h4>
            </div>
        </section>
    );
}
