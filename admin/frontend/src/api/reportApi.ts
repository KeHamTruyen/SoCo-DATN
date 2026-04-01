import { http } from "@/lib/httpClient";
import { mapApiReportToRow } from "@/lib/mapReport";
import type { Report } from "@/types/report.types";

interface RawReport {
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    description: string | null;
    status: string;
    createdAt: string;
    reporter?: { fullName?: string | null; username?: string | null };
    targetTitle?: string | null;
    targetSubtitle?: string | null;
    targetPreview?: string | null;
    targetImageUrl?: string | null;
    targetStatus?: string | null;
    targetDeleted?: boolean;
    targetDetail?: Report["targetDetail"];
}

interface ListRes {
    success: boolean;
    data: RawReport[];
    pagination?: { page: number; limit: number; total: number };
}

export const reportApi = {
    async listReports(params?: {
        status?: string;
        targetType?: string;
        page?: number;
        limit?: number;
    }) {
        const q = new URLSearchParams();
        if (params?.status) q.set("status", params.status);
        if (params?.targetType) q.set("targetType", params.targetType);
        if (params?.page != null) q.set("page", String(params.page));
        if (params?.limit != null) q.set("limit", String(params.limit));
        const res = await http<ListRes>(`/reports?${q.toString()}`);
        const items = (res.data ?? []).map(mapApiReportToRow);
        const total = res.pagination?.total ?? items.length;
        return { items, total };
    },

    async resolveReport(
        reportId: string,
        body: { resolution?: string; status?: string },
    ) {
        await http(`/reports/${reportId}/resolve`, {
            method: "PATCH",
            body,
        });
    },

    async dismissReport(reportId: string) {
        await reportApi.resolveReport(reportId, {
            status: "dismissed",
            resolution: "dismissed",
        });
    },

    async getReportById(reportId: string) {
        const res = await http<{ success: boolean; data: RawReport }>(
            `/reports/${reportId}`,
        );
        return mapApiReportToRow(res.data);
    },
};

export type { Report };
