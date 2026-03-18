import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ReportedContentTable } from "../features/admin/components/ReportedContentTable";
import { reportApi } from "../features/report/api/reportApi";
import type { Report } from "../features/report/types/report.types";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { UnifiedHeader } from "../shared/ui";

export default function AdminDashboard() {
    const { user } = useAuthSession();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: "",
        priority: "",
        dateRange: "last_7_days",
    });

    const isAdmin = (user as { role?: string } | null)?.role === "admin";

    useEffect(() => {
        if (!isAdmin) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await reportApi.listReports(filters);
                if (!mounted) return;
                setReports(data.items);
            } catch {
                if (!mounted) return;
                setReports([]);
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [isAdmin, filters]);

    if (!isAdmin) {
        return <Navigate to="/feed" replace />;
    }

    const handleDismiss = async (id: string) => {
        await reportApi.dismissReport(id);
        setReports((prev) => prev.filter((r) => r.id !== id));
    };

    const handleDeleteContent = async (id: string) => {
        await reportApi.deleteReportedContent(id);
        setReports((prev) => prev.filter((r) => r.id !== id));
    };

    const handleBlockUser = async (id: string) => {
        await reportApi.blockUser(id);
        setReports((prev) => prev.filter((r) => r.id !== id));
    };

    const stats = {
        total: reports.length,
        high: reports.filter((r) => r.priority === "high").length,
        medium: reports.filter((r) => r.priority === "medium").length,
        pending: reports.filter((r) => r.status === "pending").length,
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                    { label: "Admin", to: "/admin" },
                ]}
                activePath="/admin"
            />
            <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        Reported Content Management
                    </p>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: "Total Reports", value: stats.total, color: "text-slate-900 dark:text-slate-100" },
                        { label: "High Priority", value: stats.high, color: "text-red-600" },
                        { label: "Medium Priority", value: stats.medium, color: "text-yellow-600" },
                        { label: "Pending Review", value: stats.pending, color: "text-primary" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                        >
                            <p className="text-sm text-slate-500">{stat.label}</p>
                            <p className={`mt-1 text-3xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="min-w-[200px] flex-1">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Category
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900"
                            >
                                <option value="">All Categories</option>
                                <option value="inappropriate_content">Inappropriate Content</option>
                                <option value="fake_product">Scam</option>
                                <option value="spam">Spam</option>
                                <option value="harassment">Harassment</option>
                            </select>
                        </div>
                        <div className="min-w-[200px] flex-1">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Priority
                            </label>
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900"
                            >
                                <option value="">All Priorities</option>
                                <option value="high">High Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="low">Low Priority</option>
                            </select>
                        </div>
                        <div className="min-w-[200px] flex-1">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Date Range
                            </label>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => setFilters((f) => ({ ...f, dateRange: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900"
                            >
                                <option value="last_24h">Last 24 Hours</option>
                                <option value="last_7_days">Last 7 Days</option>
                                <option value="last_30_days">Last 30 Days</option>
                            </select>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                            />
                        ))}
                    </div>
                ) : (
                    <ReportedContentTable
                        reports={reports}
                        onDismiss={(id) => void handleDismiss(id)}
                        onDeleteContent={(id) => void handleDeleteContent(id)}
                        onBlockUser={(id) => void handleBlockUser(id)}
                    />
                )}
            </main>
        </div>
    );
}
