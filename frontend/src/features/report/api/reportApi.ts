import { httpClient } from "../../../shared/api/httpClient";
import type {
    CreateReportPayload,
    Report,
    ReportsListResponse,
} from "../types/report.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

export const reportApi = {
    async createReport(payload: CreateReportPayload) {
        const res = await httpClient.post<ApiResponse<Report> | Report>(
            "/reports",
            payload,
            { requiresAuth: true },
        );
        return unwrap<Report>(res);
    },
    async listReports(params?: {
        category?: string;
        priority?: string;
        dateRange?: string;
    }) {
        const query = new URLSearchParams();
        if (params?.category) query.set("category", params.category);
        if (params?.priority) query.set("priority", params.priority);
        if (params?.dateRange) query.set("dateRange", params.dateRange);
        const res = await httpClient.get<
            ApiResponse<ReportsListResponse> | ReportsListResponse
        >(`/admin/reports?${query.toString()}`, { requiresAuth: true });
        return unwrap<ReportsListResponse>(res);
    },
    async dismissReport(reportId: string) {
        return httpClient.patch(
            `/admin/reports/${reportId}/dismiss`,
            {},
            { requiresAuth: true },
        );
    },
    async deleteReportedContent(reportId: string) {
        return httpClient.delete(`/admin/reports/${reportId}/content`, {
            requiresAuth: true,
        });
    },
    async blockUser(reportId: string) {
        return httpClient.post(
            `/admin/reports/${reportId}/block-user`,
            {},
            { requiresAuth: true },
        );
    },
};
