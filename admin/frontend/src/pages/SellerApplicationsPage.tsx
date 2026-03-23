import { useCallback, useEffect, useState } from "react";
import {
    sellerAdminApi,
    type SellerApplicationAdmin,
} from "@/features/seller-applications/api/sellerAdminApi";
import { SellerApplicationDetailModal } from "@/features/seller-applications/components/SellerApplicationDetailModal";
import { SellerApplicationList } from "@/features/seller-applications/components/SellerApplicationList";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

export default function SellerApplicationsPage() {
    const [applications, setApplications] = useState<SellerApplicationAdmin[]>(
        [],
    );
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;
    const [status, setStatus] = useState("REVIEWING");
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<SellerApplicationAdmin | null>(null);
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

            {detail ? (
                <SellerApplicationDetailModal
                    detail={detail}
                    onClose={() => setDetail(null)}
                    onRequestApprove={() => {
                        setApproveId(detail.id);
                        setDetail(null);
                    }}
                    onRequestReject={() => {
                        setRejectId(detail.id);
                        setDetail(null);
                    }}
                />
            ) : null}

            <ConfirmDialog
                open={Boolean(approveId)}
                title="Approve application?"
                onClose={() => setApproveId(null)}
                onConfirm={async () => {
                    if (!approveId) return;
                    await sellerAdminApi.approve(approveId);
                    await load();
                    setDetail(null);
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
                    await sellerAdminApi.reject(
                        rejectId,
                        "Rejected by admin",
                    );
                    await load();
                    setDetail(null);
                }}
            />
        </div>
    );
}
