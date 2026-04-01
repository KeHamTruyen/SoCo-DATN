import { useCallback, useEffect, useState } from "react";
import { ReportedContentTable } from "@/components/ReportedContentTable";
import { ReportDetailModal } from "@/components/ReportDetailModal";
import { adminApi } from "@/api/adminApi";
import { reportApi } from "@/api/reportApi";
import type { Report } from "@/types/report.types";
import { HttpError } from "@/lib/httpClient";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

type PendingAction =
    | { type: "dismiss"; report: Report }
    | { type: "delete"; report: Report }
    | { type: "block"; report: Report }
    | null;

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("pending");
    const [targetType, setTargetType] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionPendingId, setActionPendingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { items } = await reportApi.listReports({
                status: status || undefined,
                targetType: targetType || undefined,
                limit: 50,
            });
            setReports(items);
        } catch (err) {
            setReports([]);
            if (err instanceof HttpError) {
                if (err.status === 401 || err.status === 403) {
                    setError("Phien admin khong hop le hoac da het han.");
                } else {
                    setError(err.message || "Khong the tai danh sach report.");
                }
            } else {
                setError("Khong the tai danh sach report.");
            }
        } finally {
            setLoading(false);
        }
    }, [status, targetType]);

    useEffect(() => {
        void load();
    }, [load]);

    const updateReportRow = useCallback((next: Report) => {
        setReports((prev) => prev.map((item) => (item.id === next.id ? next : item)));
    }, []);

    const openReportDetail = async (report: Report) => {
        setSelectedReport(report);
        setDetailLoading(true);
        setActionError(null);
        try {
            const detail = await reportApi.getReportById(report.id);
            setSelectedReport(detail);
            updateReportRow(detail);
        } catch (err) {
            if (err instanceof HttpError) {
                setActionError(err.message || "Khong the tai chi tiet report.");
            } else {
                setActionError("Khong the tai chi tiet report.");
            }
        } finally {
            setDetailLoading(false);
        }
    };

    const runDismiss = async (report: Report) => {
        setActionPendingId(report.id);
        setActionError(null);
        try {
            await reportApi.dismissReport(report.id);
            setReports((prev) => prev.filter((item) => item.id !== report.id));
            setSelectedReport((prev) => (prev?.id === report.id ? null : prev));
        } catch (err) {
            if (err instanceof HttpError) {
                setActionError(err.message || "Khong the dismiss report.");
            } else {
                setActionError("Khong the dismiss report.");
            }
            throw err;
        } finally {
            setActionPendingId(null);
        }
    };

    const runDeleteTarget = async (report: Report) => {
        setActionPendingId(report.id);
        setActionError(null);
        try {
            if (report.targetDeleted) {
                await reportApi.resolveReport(report.id, {
                    status: "resolved",
                    resolution: "target_unavailable",
                });
            } else if (report.targetType === "post") {
                await adminApi.deletePost(report.targetId);
                await reportApi.resolveReport(report.id, {
                    status: "resolved",
                    resolution: "content_removed",
                });
            } else if (report.targetType === "product") {
                await adminApi.deleteProduct(report.targetId);
                await reportApi.resolveReport(report.id, {
                    status: "resolved",
                    resolution: "content_removed",
                });
            } else {
                await reportApi.resolveReport(report.id, {
                    status: "resolved",
                    resolution: "no_content_delete",
                });
            }
            setReports((prev) => prev.filter((item) => item.id !== report.id));
            setSelectedReport((prev) => (prev?.id === report.id ? null : prev));
        } catch (err) {
            if (err instanceof HttpError) {
                setActionError(err.message || "Khong the xu ly noi dung bi report.");
            } else {
                setActionError("Khong the xu ly noi dung bi report.");
            }
            throw err;
        } finally {
            setActionPendingId(null);
        }
    };

    const runBlockUser = async (report: Report) => {
        if (report.targetType !== "user") return;
        setActionPendingId(report.id);
        setActionError(null);
        try {
            await adminApi.toggleUserActive(report.targetId);
            await reportApi.resolveReport(report.id, {
                status: "resolved",
                resolution: "user_toggled",
            });
            setReports((prev) => prev.filter((item) => item.id !== report.id));
            setSelectedReport((prev) => (prev?.id === report.id ? null : prev));
        } catch (err) {
            if (err instanceof HttpError) {
                setActionError(err.message || "Khong the cap nhat trang thai user.");
            } else {
                setActionError("Khong the cap nhat trang thai user.");
            }
            throw err;
        } finally {
            setActionPendingId(null);
        }
    };

    const confirmTitle =
        pendingAction?.type === "dismiss"
            ? "Dismiss report?"
            : pendingAction?.type === "delete"
              ? "Delete or resolve target?"
              : "Toggle user active state?";

    const confirmDescription =
        pendingAction?.type === "dismiss"
            ? "This report will be marked as dismissed and removed from the current list."
            : pendingAction?.type === "delete"
              ? "For posts/products the target will be deleted, then the report will be resolved. For users/comments, the report will be resolved without deleting the target."
              : "This will toggle the reported user's active state, then resolve the report.";

    return (
        <div>
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Reported Content
                    </h2>
                    <p className="mt-1 text-muted-foreground">
                        Review and manage community flagged posts, products, users, and comments.
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
                            <option value="">All</option>
                            <option value="pending">Pending</option>
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

            {error ? (
                <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            ) : null}

            {actionError ? (
                <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                    {actionError}
                </div>
            ) : null}

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                    ))}
                </div>
            ) : (
                <ReportedContentTable
                    reports={reports}
                    onDismiss={(id) => {
                        const report = reports.find((item) => item.id === id);
                        if (report) setPendingAction({ type: "dismiss", report });
                    }}
                    onDeleteContent={(report) =>
                        setPendingAction({ type: "delete", report })
                    }
                    onBlockUser={(report) =>
                        setPendingAction({ type: "block", report })
                    }
                    onOpenDetail={(report) => void openReportDetail(report)}
                    actionPendingId={actionPendingId ?? pendingAction?.report.id ?? null}
                />
            )}

            {selectedReport ? (
                <ReportDetailModal
                    report={selectedReport}
                    loading={detailLoading}
                    onClose={() => setSelectedReport(null)}
                />
            ) : null}

            <ConfirmDialog
                open={Boolean(pendingAction)}
                title={confirmTitle}
                description={confirmDescription}
                confirmLabel={
                    pendingAction?.type === "dismiss"
                        ? "Dismiss"
                        : pendingAction?.type === "delete"
                          ? "Continue"
                          : "Toggle user"
                }
                processingLabel="Processing..."
                variant={
                    pendingAction?.type === "delete" || pendingAction?.type === "block"
                        ? "danger"
                        : "default"
                }
                onClose={() => setPendingAction(null)}
                onConfirm={async () => {
                    if (!pendingAction) return;
                    if (pendingAction.type === "dismiss") {
                        await runDismiss(pendingAction.report);
                    } else if (pendingAction.type === "delete") {
                        await runDeleteTarget(pendingAction.report);
                    } else {
                        await runBlockUser(pendingAction.report);
                    }
                }}
            />
        </div>
    );
}
