import type { SellerSensitiveChangeRequest } from "@/features/seller-applications/api/sellerAdminApi";

type Props = {
    loading: boolean;
    error: string | null;
    requests: SellerSensitiveChangeRequest[];
    page: number;
    totalPages: number;
    canReview: boolean;
    onPagePrev: () => void;
    onPageNext: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
};

export function SensitiveChangeList({
    loading,
    error,
    requests,
    page,
    totalPages,
    canReview,
    onPagePrev,
    onPageNext,
    onApprove,
    onReject,
}: Props) {
    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-24 animate-pulse rounded-xl bg-muted"
                    />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                No pending sensitive change requests.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((r) => (
                <article
                    key={r.id}
                    className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm"
                >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-foreground">
                                {r.user?.fullName ||
                                    r.user?.username ||
                                    "Seller"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {r.user?.email}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Submitted{" "}
                                {new Date(r.createdAt).toLocaleString()}
                            </p>
                        </div>
                        {canReview ? (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => onApprove(r.id)}
                                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onReject(r.id)}
                                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                                >
                                    Reject
                                </button>
                            </div>
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                Read-only
                            </span>
                        )}
                    </div>
                    <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-xs font-semibold uppercase text-muted-foreground">
                                ID card
                            </dt>
                            <dd className="text-foreground">
                                {r.idCardNumberMasked || "—"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-semibold uppercase text-muted-foreground">
                                Bank account
                            </dt>
                            <dd className="text-foreground">
                                {r.bankAccountNumberMasked || "—"}
                                {r.bankName ? ` · ${r.bankName}` : ""}
                                {r.bankAccountName
                                    ? ` · ${r.bankAccountName}`
                                    : ""}
                            </dd>
                        </div>
                    </dl>
                    {(r.idCardFrontSignedUrl || r.idCardBackSignedUrl) && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {r.idCardFrontSignedUrl ? (
                                <a
                                    href={r.idCardFrontSignedUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-primary hover:underline"
                                >
                                    Front ID image
                                </a>
                            ) : null}
                            {r.idCardBackSignedUrl ? (
                                <a
                                    href={r.idCardBackSignedUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-primary hover:underline"
                                >
                                    Back ID image
                                </a>
                            ) : null}
                        </div>
                    )}
                </article>
            ))}
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    Page {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={onPagePrev}
                        className="rounded border border-border px-2 py-1 text-sm disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={onPageNext}
                        className="rounded border border-border px-2 py-1 text-sm disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
