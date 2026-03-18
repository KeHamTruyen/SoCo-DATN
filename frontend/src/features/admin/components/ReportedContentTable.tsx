import { cn } from "../../../shared/lib/cn";
import type { Report, ReportPriority } from "../../report/types/report.types";

const PRIORITY_COLOR: Record<ReportPriority, string> = {
    high: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    medium: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const PRIORITY_DOT: Record<ReportPriority, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-slate-400",
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

interface ReportedContentTableProps {
    reports: Report[];
    onDismiss: (id: string) => void;
    onDeleteContent: (id: string) => void;
    onBlockUser: (id: string) => void;
}

export function ReportedContentTable({
    reports,
    onDismiss,
    onDeleteContent,
    onBlockUser,
}: ReportedContentTableProps) {
    if (reports.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                No reports found.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Content Preview
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Type & Priority
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Reporter Message
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {reports.map((report) => (
                            <tr
                                key={report.id}
                                className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                            {report.targetImageUrl && (
                                                <img
                                                    src={report.targetImageUrl}
                                                    alt={report.targetTitle}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {report.targetTitle ?? `${report.targetType} content`}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                ID: #{report.reportNumber}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1.5">
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            {REASON_LABEL[report.reason] ?? report.reason}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className={cn(
                                                    "h-1.5 w-1.5 rounded-full",
                                                    PRIORITY_DOT[report.priority],
                                                )}
                                            />
                                            <span className="text-xs font-medium capitalize text-slate-600 dark:text-slate-400">
                                                {report.priority} Priority
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {report.description ? (
                                        <p className="line-clamp-2 max-w-xs text-sm italic text-slate-600 dark:text-slate-300">
                                            "{report.description}"
                                        </p>
                                    ) : (
                                        <p className="text-sm text-slate-400">No description provided</p>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onDismiss(report.id)}
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteContent(report.id)}
                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
                                        >
                                            Delete Post
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onBlockUser(report.id)}
                                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 dark:bg-slate-100 dark:text-slate-900"
                                        >
                                            Block User
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
