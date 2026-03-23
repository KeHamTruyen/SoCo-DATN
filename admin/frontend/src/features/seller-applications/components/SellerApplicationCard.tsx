import type { SellerApplicationAdmin } from "@/features/seller-applications/api/sellerAdminApi";

type Props = {
    application: SellerApplicationAdmin;
    onOpenDetail: (a: SellerApplicationAdmin) => void;
};

export function SellerApplicationCard({ application: a, onOpenDetail }: Props) {
    const open = () => onOpenDetail(a);
    const isReviewing = a.status === "REVIEWING";

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={open}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                }
            }}
            className="flex flex-wrap cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground transition hover:bg-muted/40"
        >
            <div>
                <p className="font-semibold text-foreground">
                    {a.user?.fullName || a.user?.username}
                </p>
                <p className="text-sm text-muted-foreground">{a.user?.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {a.status} · {new Date(a.createdAt).toLocaleString()}
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
                {isReviewing ? (
                    <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground">
                        Reviewing
                    </span>
                ) : a.status === "APPROVED" ? (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Approved
                    </span>
                ) : a.status === "REJECTED" ? (
                    <div className="max-w-xs text-right">
                        <span className="inline-block rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">
                            Rejected
                        </span>
                        {a.rejectionReason ? (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {a.rejectionReason}
                            </p>
                        ) : null}
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">{a.status}</span>
                )}
            </div>
        </div>
    );
}
