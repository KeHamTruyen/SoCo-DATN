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

export type ReportTargetDetail =
    | {
          kind: "post";
          id: string;
          content: string | null;
          mediaUrls: string[];
          status: string;
          createdAt: string;
          author: {
              id: string;
              username: string;
              fullName: string | null;
              avatarUrl: string | null;
          };
      }
    | {
          kind: "product";
          id: string;
          title: string;
          description: string | null;
          status: string;
          price: string | number;
          createdAt: string;
          seller: {
              id: string;
              username: string;
              fullName: string | null;
          };
          images: Array<{ imageUrl: string }>;
      }
    | {
          kind: "user";
          id: string;
          username: string;
          fullName: string | null;
          email: string;
          avatarUrl: string | null;
          bio: string | null;
          role: string;
          isActive: boolean;
          createdAt: string;
      }
    | {
          kind: "comment";
          id: string;
          content: string;
          createdAt: string;
          user: {
              id: string;
              username: string;
              fullName: string | null;
              avatarUrl: string | null;
          };
          post: {
              id: string;
              content: string | null;
              mediaUrls: string[];
          };
      };

export interface Report {
    id: string;
    reportNumber: string;
    targetType: ReportTargetType;
    targetId: string;
    targetTitle?: string;
    targetSubtitle?: string;
    targetPreview?: string;
    targetImageUrl?: string;
    targetStatus?: string;
    targetDeleted?: boolean;
    reason: ReportReason;
    description?: string;
    status: string;
    priority: ReportPriority;
    createdAt: string;
    reporterName?: string;
    targetDetail?: ReportTargetDetail | null;
}
