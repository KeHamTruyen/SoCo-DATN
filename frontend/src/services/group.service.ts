import api from './api';

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

interface GroupUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  privacy: 'PUBLIC' | 'PRIVATE' | 'SECRET';
  coverImageUrl: string | null;
  avatarUrl: string | null;
  membersCount: number;
  creator: GroupUser;
  isMember?: boolean;
  memberRole?: 'ADMIN' | 'MODERATOR' | 'MEMBER' | null;
  _count?: {
    members: number;
  };
}

export interface GroupMember {
  id: string;
  groupId: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
  user: GroupUser;
}

const groupService = {
  getMyGroups: async (page = 1, limit = 20): Promise<PaginatedResponse<Group>> => {
    const response = await api.get<PaginatedResponse<Group>>(`/groups/me?page=${page}&limit=${limit}`);
    return response.data;
  },

  getGroups: async (
    page = 1,
    limit = 20,
    search?: string
  ): Promise<PaginatedResponse<Group>> => {
    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
    const response = await api.get<PaginatedResponse<Group>>(
      `/groups?page=${page}&limit=${limit}${searchQuery}`
    );
    return response.data;
  },

  getGroupById: async (groupId: string): Promise<ApiResponse<Group>> => {
    const response = await api.get<ApiResponse<Group>>(`/groups/${groupId}`);
    return response.data;
  },

  joinGroup: async (groupId: string): Promise<ApiResponse<{ joined: boolean }>> => {
    const response = await api.post<ApiResponse<{ joined: boolean }>>(`/groups/${groupId}/join`);
    return response.data;
  },

  leaveGroup: async (groupId: string): Promise<ApiResponse<{ left: boolean }>> => {
    const response = await api.post<ApiResponse<{ left: boolean }>>(`/groups/${groupId}/leave`);
    return response.data;
  },

  getMembers: async (
    groupId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<GroupMember>> => {
    const response = await api.get<PaginatedResponse<GroupMember>>(
      `/groups/${groupId}/members?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

export default groupService;
