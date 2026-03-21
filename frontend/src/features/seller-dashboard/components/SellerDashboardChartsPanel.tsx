import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { SellerStats } from "../../profile/types/profile.types";

function buildWeekSeries(total: number, points: number) {
    if (total <= 0) {
        return Array.from({ length: points }, (_, i) => ({
            name: `W${i + 1}`,
            value: 0,
        }));
    }
    const base = total / points;
    return Array.from({ length: points }, (_, i) => {
        const jitter = 0.65 + ((i * 7) % 13) / 26;
        return {
            name: `Tuần ${i + 1}`,
            value: Math.max(0, Math.round(base * jitter)),
        };
    });
}

interface SellerDashboardChartsPanelProps {
    stats: SellerStats;
}

export function SellerDashboardChartsPanel({ stats }: SellerDashboardChartsPanelProps) {
    const salesSeries = buildWeekSeries(stats.monthlySales, 7);
    const ordersSeries = buildWeekSeries(stats.newOrders, 7);
    const viewsSeries = buildWeekSeries(stats.productViews, 7);

    return (
        <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="mb-4 text-sm font-bold text-neutral-800 dark:text-neutral-100">
                        Xu hướng doanh thu (ước tính theo tháng)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ec5b13" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#ec5b13" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} width={40} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "0.75rem",
                                        border: "1px solid var(--color-border, #e5e5e5)",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#ec5b13"
                                    fill="url(#salesFill)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="mb-4 text-sm font-bold text-neutral-800 dark:text-neutral-100">
                        Đơn hàng mới (phân bổ theo tuần)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ordersSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "0.75rem",
                                        border: "1px solid var(--color-border, #e5e5e5)",
                                    }}
                                />
                                <Bar dataKey="value" fill="#ec5b13" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="mb-4 text-sm font-bold text-neutral-800 dark:text-neutral-100">
                    Lượt xem sản phẩm (ước tính theo tuần)
                </h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={viewsSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={44} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "0.75rem",
                                    border: "1px solid var(--color-border, #e5e5e5)",
                                }}
                            />
                            <Bar dataKey="value" fill="rgb(59 130 246)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                Biểu đồ phân bổ theo tuần là ước lượng từ tổng tháng; API chuỗi thời gian chi tiết có thể bổ sung sau.
            </p>
        </div>
    );
}
