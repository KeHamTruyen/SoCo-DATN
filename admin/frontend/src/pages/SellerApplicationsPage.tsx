import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    sellerAdminApi,
    type SellerApplicationAdmin,
    type SellerSensitiveChangeRequest,
} from "@/features/seller-applications/api/sellerAdminApi";
import { SellerApplicationDetailModal } from "@/features/seller-applications/components/SellerApplicationDetailModal";
import { SellerApplicationList } from "@/features/seller-applications/components/SellerApplicationList";
import { SensitiveChangeList } from "@/features/seller-applications/components/SensitiveChangeList";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useAbility } from "@/auth/AbilityContext";
import { HttpError } from "@/lib/httpClient";

type Tab = "applications" | "sensitive";

export default function SellerApplicationsPage() {
    const ability = useAbility();
    const [searchParams] = useSearchParams();
    const canReviewApp = ability.can("review", "SellerApplication");
    const canReadSensitive = ability.can("read", "SensitiveChange");
    const canReviewSensitive = ability.can("review", "SensitiveChange");

    const [tab, setTab] = useState<Tab>(() => {
        const q = searchParams.get("tab");
        if (q === "sensitive" && ability.can("read", "SensitiveChange")) {
            return "sensitive";
        }
        return "applications";
    });
    const [applications, setApplications] = useState<SellerApplicationAdmin[]>(
        [],
    );
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;
    const [status, setStatus] = useState("REVIEWING");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detail, setDetail] = useState<SellerApplicationAdmin | null>(null);
    const [approveId, setApproveId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);

    const [sensitive, setSensitive] = useState<SellerSensitiveChangeRequest[]>(
        [],
    );
    const [sensitiveTotal, setSensitiveTotal] = useState(0);
    const [sensitivePage, setSensitivePage] = useState(1);
    const [sensitiveLoading, setSensitiveLoading] = useState(false);
    const [sensitiveError, setSensitiveError] = useState<string | null>(null);
    const [approveSensitiveId, setApproveSensitiveId] = useState<string | null>(
        null,
    );
    const [rejectSensitiveId, setRejectSensitiveId] = useState<string | null>(
        null,
    );

    const loadApps = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await sellerAdminApi.listApplications({
                page,
                limit,
                status: status || undefined,
            });
            setApplications(data.applications);
            setTotal(data.total);
        } catch (err) {
            setApplications([]);
            setTotal(0);
            setError(
                err instanceof HttpError
                    ? err.message
                    : "Could not load seller applications.",
            );
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    const loadSensitive = useCallback(async () => {
        if (!canReadSensitive) return;
        setSensitiveLoading(true);
        setSensitiveError(null);
        try {
            const data = await sellerAdminApi.listSensitiveChanges({
                page: sensitivePage,
                limit,
            });
            setSensitive(data.requests);
            setSensitiveTotal(data.total);
        } catch (err) {
            setSensitive([]);
            setSensitiveTotal(0);
            setSensitiveError(
                err instanceof HttpError
                    ? err.message
                    : "Could not load sensitive change requests.",
            );
        } finally {
            setSensitiveLoading(false);
        }
    }, [canReadSensitive, sensitivePage]);

    useEffect(() => {
        if (tab === "applications") void loadApps();
        else void loadSensitive();
    }, [tab, loadApps, loadSensitive]);

    useEffect(() => {
        setPage(1);
    }, [status]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const sensitiveTotalPages = Math.max(
        1,
        Math.ceil(sensitiveTotal / limit),
    );

    const tabs: { id: Tab; label: string; show: boolean }[] = [
        { id: "applications", label: "Registrations", show: true },
        {
            id: "sensitive",
            label: "Sensitive changes",
            show: canReadSensitive,
        },
    ];

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Seller review
                </h2>
                <p className="mt-1 text-muted-foreground">
                    Registrations and KYC / bank sensitive updates
                </p>
            </header>

            <div className="mb-6 flex gap-2 border-b border-border">
                {tabs
                    .filter((t) => t.show)
                    .map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={
                                tab === t.id
                                    ? "border-b-2 border-primary pb-2 text-sm font-semibold text-primary"
                                    : "pb-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                            }
                        >
                            {t.label}
                        </button>
                    ))}
            </div>

            {tab === "applications" ? (
                <>
                    {error ? (
                        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                            {error}
                        </div>
                    ) : null}
                    <SellerApplicationList
                        loading={loading}
                        applications={applications}
                        status={status}
                        onStatusChange={setStatus}
                        page={page}
                        totalPages={totalPages}
                        onPagePrev={() => setPage((p) => p - 1)}
                        onPageNext={() => setPage((p) => p + 1)}
                        onOpenDetail={setDetail}
                    />
                </>
            ) : (
                <SensitiveChangeList
                    loading={sensitiveLoading}
                    error={sensitiveError}
                    requests={sensitive}
                    page={sensitivePage}
                    totalPages={sensitiveTotalPages}
                    canReview={canReviewSensitive}
                    onPagePrev={() => setSensitivePage((p) => p - 1)}
                    onPageNext={() => setSensitivePage((p) => p + 1)}
                    onApprove={setApproveSensitiveId}
                    onReject={setRejectSensitiveId}
                />
            )}

            {detail ? (
                <SellerApplicationDetailModal
                    detail={detail}
                    canReview={canReviewApp}
                    onClose={() => setDetail(null)}
                    onRequestApprove={
                        canReviewApp
                            ? () => {
                                  setApproveId(detail.id);
                              }
                            : undefined
                    }
                    onRequestReject={
                        canReviewApp
                            ? () => {
                                  setRejectId(detail.id);
                              }
                            : undefined
                    }
                />
            ) : null}

            <ConfirmDialog
                open={Boolean(approveId)}
                title="Approve application?"
                processingLabel="Approving…"
                onClose={() => setApproveId(null)}
                onConfirm={async () => {
                    if (!approveId) return;
                    await sellerAdminApi.approve(approveId);
                    setDetail((prev) =>
                        prev?.id === approveId
                            ? {
                                  ...prev,
                                  status: "APPROVED",
                                  verifiedAt: new Date().toISOString(),
                              }
                            : prev,
                    );
                    await loadApps();
                }}
            />
            <ConfirmDialog
                open={Boolean(rejectId)}
                title="Reject application?"
                askReason
                reasonRequired
                reasonLabel="Rejection reason"
                reasonPlaceholder="Why is this application rejected?"
                confirmLabel="Reject"
                processingLabel="Rejecting…"
                variant="danger"
                onClose={() => setRejectId(null)}
                onConfirm={async (reason) => {
                    if (!rejectId) return;
                    const note = reason || "Rejected by admin";
                    await sellerAdminApi.reject(rejectId, note);
                    setDetail((prev) =>
                        prev?.id === rejectId
                            ? {
                                  ...prev,
                                  status: "REJECTED",
                                  rejectionReason: note,
                              }
                            : prev,
                    );
                    await loadApps();
                }}
            />

            <ConfirmDialog
                open={Boolean(approveSensitiveId)}
                title="Approve sensitive change?"
                description="Masked KYC / bank fields will replace the seller verification record."
                processingLabel="Approving…"
                onClose={() => setApproveSensitiveId(null)}
                onConfirm={async () => {
                    if (!approveSensitiveId) return;
                    await sellerAdminApi.approveSensitiveChange(
                        approveSensitiveId,
                    );
                    await loadSensitive();
                }}
            />
            <ConfirmDialog
                open={Boolean(rejectSensitiveId)}
                title="Reject sensitive change?"
                askReason
                reasonRequired
                reasonLabel="Rejection reason"
                confirmLabel="Reject"
                processingLabel="Rejecting…"
                variant="danger"
                onClose={() => setRejectSensitiveId(null)}
                onConfirm={async (reason) => {
                    if (!rejectSensitiveId) return;
                    await sellerAdminApi.rejectSensitiveChange(
                        rejectSensitiveId,
                        reason || "Rejected",
                    );
                    await loadSensitive();
                }}
            />
        </div>
    );
}
