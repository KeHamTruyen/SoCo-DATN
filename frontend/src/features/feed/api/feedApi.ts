import { httpClient } from "../../../shared/api/httpClient";
import type { FeedComment, FeedPageResponse, FeedPost, ScheduledPostsResponse } from "../types/feed.types";

interface ApiResponse<T> {
    data?: T;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

interface BackendPagination {
    page: number;
    limit: number;
    total: number;
}

interface BackendListResponse {
    data: FeedPost[];
    pagination?: BackendPagination;
}

export const feedApi = {
    async listPosts(cursor?: string) {
        const page = cursor ? parseInt(cursor, 10) : 1;
        const res = await httpClient.get<BackendListResponse>(
            `/posts?page=${page}`,
            { requiresAuth: true },
        );
        const posts = res.data ?? [];
        const p = res.pagination;
        const hasMore = p ? p.page * p.limit < p.total : false;
        return {
            items: posts,
            nextCursor: hasMore ? String(p!.page + 1) : null,
        } satisfies FeedPageResponse;
    },
    async createPost(content: string) {
        const res = await httpClient.post<ApiResponse<FeedPost> | FeedPost>(
            "/posts",
            { content },
            { requiresAuth: true },
        );
        return unwrap<FeedPost>(res);
    },
    async likePost(postId: string) {
        const res = await httpClient.post<ApiResponse<FeedPost> | FeedPost>(
            `/posts/${postId}/like`,
            {},
            { requiresAuth: true },
        );
        return unwrap<FeedPost>(res);
    },
    async addComment(postId: string, content: string) {
        const res = await httpClient.post<ApiResponse<FeedComment> | FeedComment>(
            `/posts/${postId}/comments`,
            { content },
            { requiresAuth: true },
        );
        return unwrap<FeedComment>(res);
    },
    async getPost(postId: string) {
        const res = await httpClient.get<ApiResponse<FeedPost> | FeedPost>(
            `/posts/${postId}`,
            { requiresAuth: true },
        );
        return unwrap<FeedPost>(res);
    },
    async createScheduledPost(content: string, scheduledAt: string, imageUrl?: string) {
        const res = await httpClient.post<ApiResponse<FeedPost> | FeedPost>(
            "/posts/scheduled",
            { content, scheduledAt, imageUrl },
            { requiresAuth: true },
        );
        return unwrap<FeedPost>(res);
    },
    async listScheduledPosts() {
        const res = await httpClient.get<ApiResponse<ScheduledPostsResponse> | ScheduledPostsResponse>(
            "/posts/scheduled",
            { requiresAuth: true },
        );
        return unwrap<ScheduledPostsResponse>(res);
    },
    async deletePost(postId: string) {
        return httpClient.delete(`/posts/${postId}`, { requiresAuth: true });
    },
};

