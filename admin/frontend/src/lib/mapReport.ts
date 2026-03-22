import type { Report, ReportPriority, ReportReason } from "@/types/report.types";

function reasonToPriority(reason: string): ReportPriority {
    const r = reason.toLowerCase();
    if (
        r.includes("scam") ||
        r.includes("fake") ||
        r.includes("inappropriate") ||
        r.includes("harassment")
    ) {
        return "high";
    }
    if (r.includes("spam")) return "low";
    return "medium";
}

function normalizeReason(reason: string): ReportReason {
    const map: Record<string, ReportReason> = {
        inappropriate_content: "inappropriate_content",
        harassment: "harassment",
        misinformation: "misinformation",
        fake_product: "fake_product",
        scam: "fake_product",
        invalid_price: "invalid_price",
        untrusted_seller: "untrusted_seller",
        spam: "spam",
        other: "other",
    };
    const k = reason.trim().toLowerCase().replace(/\s+/g, "_");
    return map[k] ?? (reason as ReportReason);
}

export function mapApiReportToRow(r: {
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    description: string | null;
    status: string;
    createdAt: string;
    reporter?: { fullName?: string | null; username?: string | null };
}): Report {
    const nr = normalizeReason(r.reason);
    return {
        id: r.id,
        reportNumber: r.id.slice(0, 8).toUpperCase(),
        targetType: r.targetType as Report["targetType"],
        targetId: r.targetId,
        targetTitle: `${r.targetType} · ${r.targetId.slice(0, 8)}…`,
        reason: nr,
        description: r.description ?? undefined,
        status: r.status,
        priority: reasonToPriority(r.reason),
        createdAt: r.createdAt,
        reporterName:
            r.reporter?.fullName || r.reporter?.username || undefined,
    };
}
