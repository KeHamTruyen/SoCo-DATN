import { httpClient } from "../../../shared/api/httpClient";
import type { Group, GroupsListResponse, GroupsQueryParams } from "../types/group.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

export const groupApi = {
    async listGroups(params: GroupsQueryParams = {}) {
        const query = new URLSearchParams();
        if (params.q) query.set("q", params.q);
        query.set("page", String(params.page ?? 1));
        query.set("pageSize", String(params.pageSize ?? 12));
        const res = await httpClient.get<ApiResponse<GroupsListResponse> | GroupsListResponse>(
            `/groups?${query.toString()}`,
            { requiresAuth: true },
        );
        return unwrap<GroupsListResponse>(res);
    },
    async getGroup(groupId: string) {
        const res = await httpClient.get<ApiResponse<Group> | Group>(`/groups/${groupId}`, {
            requiresAuth: true,
        });
        return unwrap<Group>(res);
    },
    async joinGroup(groupId: string) {
        const res = await httpClient.post<ApiResponse<Group> | Group>(
            `/groups/${groupId}/join`,
            {},
            { requiresAuth: true },
        );
        return unwrap<Group>(res);
    },
    async leaveGroup(groupId: string) {
        const res = await httpClient.delete<ApiResponse<Group> | Group>(
            `/groups/${groupId}/join`,
            { requiresAuth: true },
        );
        return unwrap<Group>(res);
    },
    async createGroup(data: { name: string; description?: string; privacy: "public" | "private" }) {
        const res = await httpClient.post<ApiResponse<Group> | Group>("/groups", data, {
            requiresAuth: true,
        });
        return unwrap<Group>(res);
    },
};
