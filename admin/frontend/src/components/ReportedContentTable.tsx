import type { Report, ReportPriority } from "@/types/report.types";

const PRIORITY_COLOR: Record<ReportPriority, string> = {
    high: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    low: "bg-muted text-muted-foreground",
};

const PRIORITY_DOT: Record<ReportPriority, string> = {
    high: "bg-red-500",
    medium: "bg-orange-500",
    low: "bg-muted-foreground",
};

const REASON_LABEL: Record<string, string> = {
    inappropriate_content: "Inappropriate",
    harassment: "Harassment",
    misinformation: "Misinformation",
    fake_product: "Scam",
    invalid_price: "Invalid Price",
    untrusted_seller: "Untrusted Seller",
    spam: "Spam",
    other: "Other",
};

type Props = {
    reports: Report[];
    onDismiss: (id: string) => void;
    onDeleteContent: (r: Report) => void;
    onBlockUser: (r: Report) => void;
    onOpenDetail: (r: Report) => void;
    actionPendingId?: string | null;
};

export function ReportedContentTable({
    reports,
    onDismiss,
    onDeleteContent,
    onBlockUser,
    onOpenDetail,
    actionPendingId,
}: Props) {
    if (reports.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                No reports found.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Reported Target
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Report Details
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Reporter & Status
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {reports.map((report) => (
                            (() => {
                                const actionsDisabled =
                                    actionPendingId === report.id ||
                                    report.status !== "pending";
                                return (
                            <tr
                                key={report.id}
                                className="transition-colors hover:bg-muted/40"
                            >
                                <td className="px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onOpenDetail(report)}
                                        className="flex w-full cursor-pointer items-start gap-3 rounded-lg text-left transition-colors hover:bg-muted/50"
                                    >
                                        {report.targetImageUrl ? (
                                            <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                <img
                                                    src={report.targetImageUrl}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                        ) : null}
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {report.targetTitle ??
                                                    `${report.targetType} content`}
                                            </p>
                                            {report.targetSubtitle ? (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {report.targetSubtitle}
                                                </p>
                                            ) : null}
                                            {report.targetPreview ? (
                                                <p className="mt-1 line-clamp-2 max-w-sm text-xs text-muted-foreground">
                                                    {report.targetPreview}
                                                </p>
                                            ) : null}
                                            <p className="mt-1 text-[11px] text-primary hover:underline">
                                                View detail
                                            </p>
                                        </div>
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-xs space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {report.targetType}
                                            </span>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PRIORITY_COLOR[report.priority]}`}
                                            >
                                                {report.priority}
                                            </span>
                                        </div>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PRIORITY_COLOR[report.priority]}`}
                                        >
                                            {REASON_LABEL[String(report.reason)] ??
                                                report.reason}
                                        </span>
                                        <p className="line-clamp-2 text-sm italic text-muted-foreground">
                                            {report.description
                                                ? `"${report.description}"`
                                                : "No description provided"}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <div
                                                className={`size-1.5 rounded-full ${PRIORITY_DOT[report.priority]}`}
                                            />
                                            <span>
                                                {report.targetStatus
                                                    ? `Target ${report.targetStatus}`
                                                    : "Target status unavailable"}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {report.reporterName || "Unknown reporter"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Submitted {new Date(report.createdAt).toLocaleString()}
                                        </p>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Report #{report.reportNumber} · {report.status}
                                        </p>
                                        {report.targetDeleted ? (
                                            <p className="text-xs text-destructive">
                                                Target unavailable
                                            </p>
                                        ) : null}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onDismiss(report.id)}
                                            disabled={actionsDisabled}
                                            className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteContent(report)}
                                            disabled={actionsDisabled}
                                            className="cursor-pointer rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Delete target
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onBlockUser(report)}
                                            disabled={
                                                report.targetType !== "user" ||
                                                actionsDisabled
                                            }
                                            className="cursor-pointer rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Block user
                                        </button>
                                    </div>
                                </td>
                            </tr>
                                );
                            })()
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
