import api from './api';

export type ScheduledPostStatus = 'scheduled' | 'published' | 'failed';

export interface ScheduledPostProduct {
  id: string;
  title: string;
  images?: Array<{
    imageUrl: string;
  }>;
}

export interface PublishedScheduledPost {
  id: string;
  content: string | null;
  createdAt: string;
  status: string;
}

export interface ScheduledPost {
  id: string;
  userId: string;
  content: string;
  mediaUrls: string[];
  mediaType: 'IMAGE' | 'VIDEO' | 'NONE';
  productId: string | null;
  scheduledTime: string;
  timezone: string;
  status: ScheduledPostStatus;
  publishedPostId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  product?: ScheduledPostProduct | null;
}

export interface ScheduledPostCounts {
  all: number;
  scheduled: number;
  published: number;
  failed: number;
}

export interface ScheduledPostPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ScheduledPostFilters {
  page?: number;
  limit?: number;
  status?: 'all' | ScheduledPostStatus;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateScheduledPostData {
  content: string;
  mediaUrls?: string[];
  mediaType?: 'IMAGE' | 'VIDEO' | 'NONE';
  productId?: string;
  scheduledTime: string;
  timezone?: string;
}

export interface ScheduledPostListResponse {
  success: boolean;
  data: ScheduledPost[];
  counts: ScheduledPostCounts;
  pagination: ScheduledPostPagination;
}

export interface ScheduledPostItemResponse {
  success: boolean;
  message?: string;
  data: ScheduledPost;
}

class ScheduledPostService {
  async getMyScheduledPosts(filters: ScheduledPostFilters = {}) {
    const response = await api.get<ScheduledPostListResponse>('/scheduled-posts/me', {
      params: filters
    });
    return response.data;
  }

  async createScheduledPost(data: CreateScheduledPostData) {
    const response = await api.post<ScheduledPostItemResponse>('/scheduled-posts', data);
    return response.data;
  }

  async publishNow(id: string) {
    const response = await api.post<ScheduledPostItemResponse>(`/scheduled-posts/${id}/publish-now`);
    return response.data;
  }

  async deleteScheduledPost(id: string) {
    const response = await api.delete<{ success: boolean; message?: string; data: { id: string; deleted: boolean } }>(`/scheduled-posts/${id}`);
    return response.data;
  }
}

export default new ScheduledPostService();
