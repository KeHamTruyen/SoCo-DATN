import type { SellerApplicationAdmin } from "@/features/seller-applications/api/sellerAdminApi";
import { SellerApplicationCard } from "@/features/seller-applications/components/SellerApplicationCard";

type Props = {
    loading: boolean;
    applications: SellerApplicationAdmin[];
    status: string;
    onStatusChange: (status: string) => void;
    page: number;
    totalPages: number;
    onPagePrev: () => void;
    onPageNext: () => void;
    onOpenDetail: (a: SellerApplicationAdmin) => void;
};

export function SellerApplicationList({
    loading,
    applications,
    status,
    onStatusChange,
    page,
    totalPages,
    onPagePrev,
    onPageNext,
    onOpenDetail,
}: Props) {
    return (
        <>
            <div className="mb-6 flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium text-muted-foreground">
                    Status
                </label>
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
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
                        <SellerApplicationCard
                            key={a.id}
                            application={a}
                            onOpenDetail={onOpenDetail}
                        />
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
                        onClick={onPagePrev}
                        className="rounded border border-border px-2 py-1 text-foreground disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={onPageNext}
                        className="rounded border border-border px-2 py-1 text-foreground disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}
