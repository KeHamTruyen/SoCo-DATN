import { useCallback, useEffect, useState } from "react";
import { ReportedContentTable } from "@/components/ReportedContentTable";
import { adminApi } from "@/api/adminApi";
import { reportApi } from "@/api/reportApi";
import type { Report } from "@/types/report.types";

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("pending");
    const [targetType, setTargetType] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { items } = await reportApi.listReports({
                status: status || undefined,
                targetType: targetType || undefined,
                limit: 50,
            });
            setReports(items);
        } catch {
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, [status, targetType]);

    useEffect(() => {
        void load();
    }, [load]);

    const onDismiss = async (id: string) => {
        await reportApi.dismissReport(id);
        setReports((prev) => prev.filter((r) => r.id !== id));
    };

    const onDeleteContent = async (r: Report) => {
        try {
            if (r.targetType === "post") {
                await adminApi.deletePost(r.targetId);
            } else if (r.targetType === "product") {
                await adminApi.deleteProduct(r.targetId);
            } else {
                await reportApi.resolveReport(r.id, {
                    status: "resolved",
                    resolution: "no_content_delete",
                });
                setReports((prev) => prev.filter((x) => x.id !== r.id));
                return;
            }
            await reportApi.resolveReport(r.id, {
                status: "resolved",
                resolution: "content_removed",
            });
            setReports((prev) => prev.filter((x) => x.id !== r.id));
        } catch {
            /* keep row; admin can retry */
        }
    };

    const onBlockUser = async (r: Report) => {
        if (r.targetType !== "user") return;
        try {
            await adminApi.toggleUserActive(r.targetId);
            await reportApi.resolveReport(r.id, {
                status: "resolved",
                resolution: "user_toggled",
            });
            setReports((prev) => prev.filter((x) => x.id !== r.id));
        } catch {
            /* ignore */
        }
    };

    return (
        <div>
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Reported Content
                    </h2>
                    <p className="mt-1 text-muted-foreground">
                        Review and manage community flagged posts and comments
                        (UC4.3).
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        Status: System Online
                    </span>
                    <div className="size-2 rounded-full bg-green-500" />
                </div>
            </header>

            <section className="mb-6 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="min-w-[160px] flex-1">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-lg border border-border bg-input-background text-sm text-foreground"
                        >
                            <option value="pending">Pending</option>
                            <option value="">All</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                    </div>
                    <div className="min-w-[160px] flex-1">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Target type
                        </label>
                        <select
                            value={targetType}
                            onChange={(e) => setTargetType(e.target.value)}
                            className="w-full rounded-lg border border-border bg-input-background text-sm text-foreground"
                        >
                            <option value="">All</option>
                            <option value="post">Post</option>
                            <option value="product">Product</option>
                            <option value="user">User</option>
                            <option value="comment">Comment</option>
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={() => void load()}
                        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                        Apply Filters
                    </button>
                </div>
            </section>

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 animate-pulse rounded-lg bg-muted"
                        />
                    ))}
                </div>
            ) : (
                <ReportedContentTable
                    reports={reports}
                    onDismiss={onDismiss}
                    onDeleteContent={onDeleteContent}
                    onBlockUser={onBlockUser}
                />
            )}
        </div>
    );
}
