import api from './api';

export type ReportTargetType = 'post' | 'comment' | 'user' | 'product';

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

const reportService = {
  createReport: async (payload: CreateReportPayload): Promise<ApiResponse<ReportItem>> => {
    const response = await api.post<ApiResponse<ReportItem>>('/reports', payload);
    return response.data;
  },

  getMyReports: async (page = 1, limit = 20): Promise<PaginatedResponse<ReportItem>> => {
    const response = await api.get<PaginatedResponse<ReportItem>>(
      `/reports/me?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

export default reportService;
