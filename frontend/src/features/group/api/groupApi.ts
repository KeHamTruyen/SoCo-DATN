import { httpClient } from "../../../shared/api/httpClient";
import type { FeedPageResponse, FeedPost, CreatePostPayload } from "../../feed/types/feed.types";
import { normalizeFeedPost } from "../../feed/utils/normalizeFeedPost";
import type { Group, GroupsListResponse, GroupsQueryParams } from "../types/group.types";

// ─── Raw shapes that match the backend JSON exactly ────────────────────────────
interface RawListResponse {
    success: boolean;
    data: Group[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface RawSingleResponse {
    success: boolean;
    data: Group;
}

interface RawPostListResponse {
    success: boolean;
    data: Record<string, unknown>[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface RawPostSingleResponse {
    success: boolean;
    data: { post: Record<string, unknown> };
}

// ─── Map backend pagination → frontend GroupsListResponse ─────────────────────
function toListResponse(raw: RawListResponse): GroupsListResponse {
    return {
        items: raw.data ?? [],
        total: raw.pagination?.total ?? 0,
        page: raw.pagination?.page ?? 1,
        pageSize: raw.pagination?.limit ?? 20,
    };
}

function toGroup(raw: RawSingleResponse): Group {
    return raw.data;
}

export const groupApi = {
    async listGroups(params: GroupsQueryParams = {}) {
        const query = new URLSearchParams();
        // backend reads "search" not "q", and "limit" not "pageSize"
        if (params.q) query.set("search", params.q);
        query.set("page", String(params.page ?? 1));
        query.set("limit", String(params.pageSize ?? 12));
        const res = await httpClient.get<RawListResponse>(
            `/groups?${query.toString()}`,
            { requiresAuth: true },
        );
        return toListResponse(res);
    },

    async getMyGroups() {
        const res = await httpClient.get<RawListResponse>(
            "/groups/me",
            { requiresAuth: true },
        );
        return toListResponse(res);
    },

    async getGroup(groupId: string) {
        const res = await httpClient.get<RawSingleResponse>(`/groups/${groupId}`, {
            requiresAuth: true,
        });
        return toGroup(res);
    },

    async joinGroup(groupId: string) {
        const res = await httpClient.post<RawSingleResponse>(
            `/groups/${groupId}/join`,
            {},
            { requiresAuth: true },
        );
        return res.data;
    },

    async leaveGroup(groupId: string) {
        const res = await httpClient.post<RawSingleResponse>(
            `/groups/${groupId}/leave`,
            {},
            { requiresAuth: true },
        );
        return res.data;
    },

    async createGroup(data: { name: string; description?: string; privacy: "public" | "private" }) {
        const res = await httpClient.post<RawSingleResponse>("/groups", data, {
            requiresAuth: true,
        });
        return toGroup(res);
    },

    async updateGroup(groupId: string, data: Partial<{
        name: string;
        description: string;
        privacy: string;
        avatarUrl: string;
        coverImageUrl: string;
    }>) {
        const res = await httpClient.put<RawSingleResponse>(`/groups/${groupId}`, data, {
            requiresAuth: true,
        });
        return toGroup(res);
    },

    async updateMemberRole(groupId: string, userId: string, role: string) {
        return httpClient.patch(`/groups/${groupId}/members/${userId}/role`, { role }, {
            requiresAuth: true,
        });
    },

    async removeMember(groupId: string, userId: string) {
        return httpClient.delete(`/groups/${groupId}/members/${userId}`, {
            requiresAuth: true,
        });
    },

    async getGroupMembers(groupId: string, page = 1, limit = 20) {
        const res = await httpClient.get<RawListResponse>(
            `/groups/${groupId}/members?page=${page}&limit=${limit}`,
        );
        return res;
    },

    // ── Group posts ─────────────────────────────────────────
    async getGroupPosts(groupId: string, page = 1, limit = 20): Promise<FeedPageResponse> {
        const res = await httpClient.get<RawPostListResponse>(
            `/groups/${groupId}/posts?page=${page}&limit=${limit}`,
            { requiresAuth: true },
        );
        const rows = res.data ?? [];
        const p = res.pagination;
        const hasMore = p ? p.page * p.limit < p.total : false;
        return {
            items: rows.map((row) => normalizeFeedPost(row)),
            nextCursor: hasMore ? String(p.page + 1) : null,
        };
    },

    async createGroupPost(groupId: string, payload: CreatePostPayload): Promise<FeedPost> {
        const res = await httpClient.post<RawPostSingleResponse>(
            `/groups/${groupId}/posts`,
            {
                content: payload.content.trim() || null,
                mediaUrls: payload.mediaUrls?.length ? payload.mediaUrls : undefined,
                mediaType: payload.mediaType,
                productId: payload.productId || undefined,
                location: payload.location?.trim() || undefined,
                feeling: payload.feeling?.trim() || undefined,
                taggedUserIds: payload.taggedUserIds?.length ? payload.taggedUserIds : undefined,
            },
            { requiresAuth: true },
        );
        return normalizeFeedPost(res.data.post);
    },
};
