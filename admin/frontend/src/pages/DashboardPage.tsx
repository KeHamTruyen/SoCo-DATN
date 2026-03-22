import { useEffect, useState } from "react";
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { adminApi } from "@/api/adminApi";

export default function DashboardPage() {
    const [stats, setStats] = useState<Awaited<
        ReturnType<typeof adminApi.getDashboard>
    > | null>(null);
    const [growth, setGrowth] = useState<Awaited<
        ReturnType<typeof adminApi.getGrowth>
    > | null>(null);
    const [days, setDays] = useState(30);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let on = true;
        void (async () => {
            try {
                const [s, g] = await Promise.all([
                    adminApi.getDashboard(),
                    adminApi.getGrowth(days),
                ]);
                if (on) {
                    setStats(s);
                    setGrowth(g);
                    setErr(null);
                }
            } catch {
                if (on) {
                    setErr("Could not load dashboard.");
                    setStats(null);
                    setGrowth(null);
                }
            }
        })();
        return () => {
            on = false;
        };
    }, [days]);

    const userChart =
        growth?.userGrowth?.map((r) => ({
            date: String(r.date).slice(0, 10),
            users: r.count,
        })) ?? [];

    return (
        <div>
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Dashboard
                    </h2>
                    <p className="mt-1 text-muted-foreground">
                        System overview and growth (UC4.4)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        Growth window
                    </span>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground"
                    >
                        <option value={7}>7 days</option>
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                    </select>
                    <div className="size-2 rounded-full bg-green-500" title="Online" />
                </div>
            </header>

            {err ? (
                <p className="mb-6 text-sm text-red-600">{err}</p>
            ) : null}

            {stats ? (
                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: "Users", value: stats.totalUsers },
                        { label: "Products", value: stats.totalProducts },
                        { label: "Posts", value: stats.totalPosts },
                        { label: "Orders", value: stats.totalOrders },
                        { label: "Sellers", value: stats.totalSellers },
                        { label: "Buyers", value: stats.totalBuyers },
                        { label: "New users today", value: stats.newUsersToday },
                        { label: "Revenue", value: stats.totalRevenue },
                    ].map((c) => (
                        <div
                            key={c.label}
                            className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm"
                        >
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {c.label}
                            </p>
                            <p className="mt-1 text-2xl font-black text-foreground">
                                {typeof c.value === "number" &&
                                c.label === "Revenue"
                                    ? c.value.toLocaleString()
                                    : c.value}
                            </p>
                        </div>
                    ))}
                </div>
            ) : null}

            <section className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-foreground">
                    New users over time
                </h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userChart}>
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="users"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
}
