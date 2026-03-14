import api from './api';

export type GroupPrivacy = 'PUBLIC' | 'PRIVATE' | 'SECRET';
export type GroupMemberRole = 'ADMIN' | 'MODERATOR' | 'MEMBER';

export interface GroupUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  isVerified?: boolean;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  avatarUrl: string | null;
  privacy: GroupPrivacy;
  membersCount: number;
  postsCount: number;
  createdAt: string;
  creator?: GroupUser | null;
  isMember?: boolean;
  memberRole?: GroupMemberRole | null;
  _count?: {
    members: number;
  };
}

export interface GroupMember {
  id: string;
  role: GroupMemberRole;
  joinedAt: string;
  user: GroupUser;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const groupService = {
  async listGroups(params: {
    q?: string;
    page?: number;
    limit?: number;
    membership?: 'all' | 'joined' | 'discover';
  } = {}): Promise<ApiResponse<Group[]>> {
    const response = await api.get<ApiResponse<Group[]>>('/groups', { params });
    return response.data;
  },

  async getMyGroups(params: { q?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<Group[]>> {
    const response = await api.get<ApiResponse<Group[]>>('/groups/my', { params });
    return response.data;
  },

  async getGroupById(groupId: string): Promise<ApiResponse<Group & {
    members?: GroupMember[];
    myMembership?: { id: string; role: GroupMemberRole; joinedAt: string } | null;
  }>> {
    const response = await api.get<ApiResponse<Group & {
      members?: GroupMember[];
      myMembership?: { id: string; role: GroupMemberRole; joinedAt: string } | null;
    }>>(`/groups/${groupId}`);
    return response.data;
  },

  async getGroupMembers(groupId: string, params: { q?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<GroupMember[]>> {
    const response = await api.get<ApiResponse<GroupMember[]>>(`/groups/${groupId}/members`, { params });
    return response.data;
  },

  async createGroup(data: {
    name: string;
    description?: string;
    privacy?: GroupPrivacy;
    coverImageUrl?: string;
    avatarUrl?: string;
  }): Promise<ApiResponse<Group>> {
    const response = await api.post<ApiResponse<Group>>('/groups', data);
    return response.data;
  },

  async joinGroup(groupId: string): Promise<ApiResponse<Group>> {
    const response = await api.post<ApiResponse<Group>>(`/groups/${groupId}/join`);
    return response.data;
  },

  async leaveGroup(groupId: string): Promise<ApiResponse<{ groupId: string; left: boolean }>> {
    const response = await api.delete<ApiResponse<{ groupId: string; left: boolean }>>(`/groups/${groupId}/join`);
    return response.data;
  }
};

export default groupService;
