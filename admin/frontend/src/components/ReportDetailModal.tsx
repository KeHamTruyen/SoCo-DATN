import type { Report } from "@/types/report.types";

type Props = {
    report: Report;
    loading?: boolean;
    onClose: () => void;
};

function formatDate(value?: string) {
    if (!value) return "N/A";
    return new Date(value).toLocaleString();
}

function renderTargetDetail(report: Report) {
    const detail = report.targetDetail;
    if (!detail) {
        return (
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Khong tim thay noi dung goc hoac noi dung da bi xoa.
            </div>
        );
    }

    if (detail.kind === "post") {
        return (
            <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm font-semibold text-foreground">
                        {detail.author.fullName || `@${detail.author.username}`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {detail.status} · {formatDate(detail.createdAt)}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                        {detail.content || "(media only post)"}
                    </p>
                </div>
                {detail.mediaUrls.length ? (
                    <div className="grid grid-cols-2 gap-3">
                        {detail.mediaUrls.map((url) => (
                            <img
                                key={url}
                                src={url}
                                alt=""
                                className="h-40 w-full rounded-xl object-cover"
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }

    if (detail.kind === "product") {
        return (
            <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                    {detail.images[0]?.imageUrl ? (
                        <img
                            src={detail.images[0].imageUrl}
                            alt=""
                            className="size-24 rounded-xl object-cover"
                        />
                    ) : (
                        <div className="size-24 rounded-xl bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-foreground">
                            {detail.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {detail.seller.fullName || `@${detail.seller.username}`}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {detail.status} · {formatDate(detail.createdAt)}
                        </p>
                        <p className="mt-3 text-sm font-medium text-foreground">
                            Gia: {String(detail.price)}
                        </p>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm whitespace-pre-wrap text-foreground">
                        {detail.description || "Khong co mo ta."}
                    </p>
                </div>
            </div>
        );
    }

    if (detail.kind === "user") {
        return (
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-4">
                    {detail.avatarUrl ? (
                        <img
                            src={detail.avatarUrl}
                            alt=""
                            className="size-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="size-16 rounded-full bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-foreground">
                            {detail.fullName || `@${detail.username}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">{detail.email}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {detail.role} · {detail.isActive ? "Active" : "Inactive"} ·{" "}
                            {formatDate(detail.createdAt)}
                        </p>
                    </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm text-foreground">
                    {detail.bio || "Khong co mo ta."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">
                    {detail.user.fullName || `@${detail.user.username}`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(detail.createdAt)}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                    {detail.content}
                </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Parent post
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                    {detail.post.content || "(media only post)"}
                </p>
            </div>
        </div>
    );
}

export function ReportDetailModal({ report, loading = false, onClose }: Props) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="presentation"
            onClick={onClose}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg"
                role="dialog"
                aria-labelledby="report-detail-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                    <div>
                        <h2 id="report-detail-title" className="text-lg font-bold text-foreground">
                            Report detail
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            #{report.reportNumber} · {report.targetType} · {report.status}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
                    >
                        Close
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <section className="space-y-4">
                            <div className="rounded-xl border border-border bg-muted/20 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Reported target
                                </p>
                                <h3 className="mt-2 text-base font-semibold text-foreground">
                                    {report.targetTitle || `${report.targetType} content`}
                                </h3>
                                {report.targetSubtitle ? (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {report.targetSubtitle}
                                    </p>
                                ) : null}
                                {report.targetStatus ? (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Status: {report.targetStatus}
                                    </p>
                                ) : null}
                            </div>
                            {loading ? (
                                <div className="h-48 animate-pulse rounded-xl bg-muted" />
                            ) : (
                                renderTargetDetail(report)
                            )}
                        </section>

                        <aside className="space-y-4">
                            <div className="rounded-xl border border-border bg-card p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Report metadata
                                </p>
                                <dl className="mt-3 space-y-3 text-sm">
                                    <div>
                                        <dt className="text-muted-foreground">Reporter</dt>
                                        <dd className="font-medium text-foreground">
                                            {report.reporterName || "Anonymous"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Reason</dt>
                                        <dd className="font-medium text-foreground">{report.reason}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Submitted</dt>
                                        <dd className="font-medium text-foreground">
                                            {formatDate(report.createdAt)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Target ID</dt>
                                        <dd className="break-all font-mono text-xs text-foreground">
                                            {report.targetId}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Reporter message
                                </p>
                                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                                    {report.description || "No description provided."}
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}
