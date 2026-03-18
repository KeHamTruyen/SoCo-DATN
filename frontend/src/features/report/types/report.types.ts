export type ReportTargetType = "post" | "product" | "user" | "comment";

export type ReportReason =
    | "inappropriate_content"
    | "harassment"
    | "misinformation"
    | "fake_product"
    | "invalid_price"
    | "untrusted_seller"
    | "spam"
    | "other";

export type ReportStatus = "pending" | "reviewed" | "dismissed" | "actioned";
export type ReportPriority = "high" | "medium" | "low";

export interface CreateReportPayload {
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
    description?: string;
}

export interface Report {
    id: string;
    reportNumber: string;
    targetType: ReportTargetType;
    targetId: string;
    targetTitle?: string;
    targetImageUrl?: string;
    reason: ReportReason;
    description?: string;
    status: ReportStatus;
    priority: ReportPriority;
    createdAt: string;
    reporterName?: string;
}

export interface ReportsListResponse {
    items: Report[];
    total: number;
}
