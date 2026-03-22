import { useCallback, useEffect, useState } from "react";
import {
    sellerAdminApi,
    type SellerApplicationAdmin,
} from "@/api/sellerAdminApi";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function SellerApplicationsPage() {
    const [applications, setApplications] = useState<SellerApplicationAdmin[]>(
        [],
    );
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;
    const [status, setStatus] = useState("REVIEWING");
    const [loading, setLoading] = useState(true);
    const [approveId, setApproveId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await sellerAdminApi.listApplications({
                page,
                limit,
                status: status || undefined,
            });
            setApplications(data.applications);
            setTotal(data.total);
        } catch {
            setApplications([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [status]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Seller applications
                </h2>
                <p className="mt-1 text-muted-foreground">
                    Review seller registrations
                </p>
            </header>

            <div className="mb-6 flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium text-muted-foreground">
                    Status
                </label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground"
                >
                    <option value="REVIEWING">Reviewing</option>
                    <option value="">All</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

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
                <div className="space-y-3">
                    {applications.map((a) => (
                        <div
                            key={a.id}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
                        >
                            <div>
                                <p className="font-semibold text-foreground">
                                    {a.user?.fullName || a.user?.username}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {a.user?.email}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {a.status} ·{" "}
                                    {new Date(a.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {a.status === "REVIEWING" ? (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setApproveId(a.id)}
                                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRejectId(a.id)}
                                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
                                    >
                                        Reject
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex justify-between text-xs text-muted-foreground">
                <span>
                    Page {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="rounded border border-border px-2 py-1 text-foreground disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded border border-border px-2 py-1 text-foreground disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>

            <ConfirmDialog
                open={Boolean(approveId)}
                title="Approve application?"
                onClose={() => setApproveId(null)}
                onConfirm={async () => {
                    if (!approveId) return;
                    try {
                        await sellerAdminApi.approve(approveId);
                        void load();
                    } catch {
                        /* ignore */
                    }
                }}
            />
            <ConfirmDialog
                open={Boolean(rejectId)}
                title="Reject application?"
                description="Optional reason can be added in a future iteration."
                confirmLabel="Reject"
                variant="danger"
                onClose={() => setRejectId(null)}
                onConfirm={async () => {
                    if (!rejectId) return;
                    try {
                        await sellerAdminApi.reject(rejectId, "Rejected by admin");
                        void load();
                    } catch {
                        /* ignore */
                    }
                }}
            />
        </div>
    );
}
