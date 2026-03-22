export type ReportTargetType = "post" | "product" | "user" | "comment";

export type ReportReason =
    | "inappropriate_content"
    | "harassment"
    | "misinformation"
    | "fake_product"
    | "invalid_price"
    | "untrusted_seller"
    | "spam"
    | "other"
    | string;

export type ReportPriority = "high" | "medium" | "low";

export interface Report {
    id: string;
    reportNumber: string;
    targetType: ReportTargetType;
    targetId: string;
    targetTitle?: string;
    targetImageUrl?: string;
    reason: ReportReason;
    description?: string;
    status: string;
    priority: ReportPriority;
    createdAt: string;
    reporterName?: string;
}
