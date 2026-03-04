import api from './api';

export interface FollowUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  bio: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FollowToggleResponse {
  success: boolean;
  message: string;
  data: {
    followed: boolean;
  };
}

interface FollowListResponse {
  success: boolean;
  data: FollowUser[];
  pagination: Pagination;
}

const followService = {
  toggleFollow: async (userId: string): Promise<FollowToggleResponse> => {
    const response = await api.post<FollowToggleResponse>(`/users/${userId}/follow`);
    return response.data;
  },

  getFollowers: async (userId: string, page = 1, limit = 20): Promise<FollowListResponse> => {
    const response = await api.get<FollowListResponse>(
      `/users/${userId}/followers?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getFollowing: async (userId: string, page = 1, limit = 20): Promise<FollowListResponse> => {
    const response = await api.get<FollowListResponse>(
      `/users/${userId}/following?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

export default followService;
