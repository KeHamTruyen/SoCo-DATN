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
};

export function ReportedContentTable({
    reports,
    onDismiss,
    onDeleteContent,
    onBlockUser,
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
                                Content Preview
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Type & Priority
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Reporter Message
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {reports.map((report) => (
                            <tr
                                key={report.id}
                                className="transition-colors hover:bg-muted/40"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                            {report.targetImageUrl ? (
                                                <img
                                                    src={report.targetImageUrl}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {report.targetTitle ??
                                                    `${report.targetType} content`}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                ID: #{report.reportNumber}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1.5">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PRIORITY_COLOR[report.priority]}`}
                                        >
                                            {REASON_LABEL[String(report.reason)] ??
                                                report.reason}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className={`size-1.5 rounded-full ${PRIORITY_DOT[report.priority]}`}
                                            />
                                            <span className="text-xs font-medium capitalize text-muted-foreground">
                                                {report.priority} Priority
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {report.description ? (
                                        <p className="line-clamp-2 max-w-xs text-sm italic text-muted-foreground">
                                            &ldquo;{report.description}&rdquo;
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No description provided
                                        </p>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onDismiss(report.id)}
                                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteContent(report)}
                                            className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                                        >
                                            Delete target
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onBlockUser(report)}
                                            disabled={report.targetType !== "user"}
                                            className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Block user
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
