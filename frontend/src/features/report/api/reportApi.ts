import { httpClient } from "../../../shared/api/httpClient";
import type { CreateReportPayload, Report } from "../types/report.types";

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
    async getMyReports(params?: { page?: number; limit?: number }) {
        const q = new URLSearchParams();
        if (params?.page != null) q.set("page", String(params.page));
        if (params?.limit != null) q.set("limit", String(params.limit));
        return httpClient.get<{
            success: boolean;
            data: Report[];
            pagination?: { page: number; limit: number; total: number };
        }>(`/reports/me?${q.toString()}`, { requiresAuth: true });
    },
};
