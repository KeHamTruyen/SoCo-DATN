import { httpClient } from "../../../shared/api/httpClient";
import type {
    CreatePostPayload,
    FeedComment,
    FeedPageResponse,
    FeedPost,
    ScheduledPostsResponse,
} from "../types/feed.types";
import { normalizeFeedPost } from "../utils/normalizeFeedPost";

interface ApiResponse<T> {
    data?: T;
}

interface PostEnvelope {
    post?: Record<string, unknown>;
}

function unwrap<T>(res: ApiResponse<T> | T | null | undefined): T | undefined {
    if (res == null) return undefined;
    if (typeof res === "object" && res !== null && "data" in res) {
        return (res as ApiResponse<T>).data as T;
    }
    return res as T;
}

/** Backend wraps single post as `{ post }` after unwrap of `{ data }`. */
function extractPost(raw: unknown): FeedPost {
    if (raw && typeof raw === "object" && "post" in raw) {
        const p = (raw as PostEnvelope).post;
        return normalizeFeedPost(p as Record<string, unknown>);
    }
    return normalizeFeedPost(raw as Record<string, unknown>);
}

interface BackendPagination {
    page: number;
    limit: number;
    total: number;
}

interface BackendListResponse {
    success?: boolean;
    data?: Record<string, unknown>[];
    pagination?: BackendPagination;
}

interface ScheduledListEnvelope {
    posts?: Record<string, unknown>[];
    total?: number;
    page?: number;
    limit?: number;
}

function buildCreateBody(payload: CreatePostPayload): Record<string, unknown> {
    const body: Record<string, unknown> = {
        content: payload.content.trim() || null,
        mediaUrls: payload.mediaUrls?.length ? payload.mediaUrls : undefined,
        mediaType: payload.mediaType,
        productId: payload.productId || undefined,
        location: payload.location?.trim() || undefined,
        feeling: payload.feeling?.trim() || undefined,
        taggedUserIds: payload.taggedUserIds?.length ? payload.taggedUserIds : undefined,
    };
    return body;
}

export const feedApi = {
    async listPosts(cursor?: string) {
        const page = cursor ? parseInt(cursor, 10) : 1;
        const res = await httpClient.get<BackendListResponse>(`/posts?page=${page}`, {
            requiresAuth: true,
        });
        const rows = res.data ?? [];
        const p = res.pagination;
        const hasMore = p ? p.page * p.limit < p.total : false;
        return {
            items: rows.map((row) => normalizeFeedPost(row)),
            nextCursor: hasMore ? String(p!.page + 1) : null,
        } satisfies FeedPageResponse;
    },

    async createPost(payload: CreatePostPayload) {
        const res = await httpClient.post<ApiResponse<PostEnvelope> | PostEnvelope>(
            "/posts",
            buildCreateBody(payload),
            { requiresAuth: true },
        );
        const inner = unwrap(res);
        return extractPost(inner);
    },

    /** Toggle like; API returns `{ liked }` only — caller should rely on optimistic UI. */
    async likePost(postId: string): Promise<Partial<FeedPost>> {
        await httpClient.post<ApiResponse<{ liked: boolean }>>(`/posts/${postId}/like`, {}, {
            requiresAuth: true,
        });
        return {};
    },

    async addComment(postId: string, content: string) {
        const res = await httpClient.post<ApiResponse<{ comment: FeedComment }>>(
            `/posts/${postId}/comments`,
            { content },
            { requiresAuth: true },
        );
        const inner = unwrap(res);
        if (inner && typeof inner === "object" && "comment" in inner) {
            return (inner as { comment: FeedComment }).comment;
        }
        throw new Error("Invalid comment response");
    },

    async getPost(postId: string) {
        const res = await httpClient.get<ApiResponse<PostEnvelope> | PostEnvelope>(
            `/posts/${postId}`,
            { requiresAuth: true },
        );
        const inner = unwrap(res);
        return extractPost(inner);
    },

    async createScheduledPost(payload: CreatePostPayload) {
        if (!payload.scheduledAt) {
            throw new Error("scheduledAt is required");
        }
        const scheduledTime = new Date(payload.scheduledAt).toISOString();
        const body = {
            ...buildCreateBody(payload),
            scheduledTime,
            timezone: "Asia/Ho_Chi_Minh",
        };
        const res = await httpClient.post<ApiResponse<PostEnvelope> | PostEnvelope>(
            "/scheduled-posts",
            body,
            { requiresAuth: true },
        );
        const inner = unwrap(res);
        return extractPost(inner);
    },

    async listScheduledPosts() {
        const res = await httpClient.get<
            ApiResponse<ScheduledListEnvelope> | ScheduledListEnvelope
        >("/scheduled-posts", { requiresAuth: true });
        const inner = unwrap(res) as ScheduledListEnvelope | undefined;
        const posts = inner?.posts ?? [];
        const items = posts.map((row) =>
            normalizeFeedPost({
                ...row,
                scheduledAt:
                    row.scheduledTime != null
                        ? String(row.scheduledTime)
                        : row.scheduledAt != null
                          ? String(row.scheduledAt)
                          : undefined,
                isScheduled: true,
                imageUrl: (row.mediaUrls as string[] | undefined)?.[0],
            } as Record<string, unknown>),
        );
        return {
            items,
            total: inner?.total ?? items.length,
        } satisfies ScheduledPostsResponse;
    },

    async deletePost(postId: string) {
        return httpClient.delete(`/posts/${postId}`, { requiresAuth: true });
    },

    async deleteScheduledPost(scheduledPostId: string) {
        return httpClient.delete(`/scheduled-posts/${scheduledPostId}`, {
            requiresAuth: true,
        });
    },
};
