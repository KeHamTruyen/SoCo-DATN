import { httpClient } from "../../../shared/api/httpClient";
import type { TaggedUserBrief } from "../../feed/types/feed.types";

interface SearchUsersResponse {
    data?: TaggedUserBrief[];
}

/** GET /users/search — returns partial user profiles for tagging. */
export async function searchUsers(q: string, limit = 12): Promise<TaggedUserBrief[]> {
    const query = new URLSearchParams();
    query.set("q", q.trim());
    query.set("limit", String(limit));
    const res = await httpClient.get<SearchUsersResponse>(`/users/search?${query.toString()}`, {
        requiresAuth: true,
    });
    const rows = res.data ?? [];
    return rows.map((u) => ({
        id: String(u.id ?? ""),
        username: u.username,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
    }));
}
