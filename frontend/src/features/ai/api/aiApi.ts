import { httpClient } from "../../../shared/api/httpClient";

type ApiWrapped<T> = {
    success?: boolean;
    data?: T;
};

function unwrap<T>(res: ApiWrapped<T> | T): T {
    if (res && typeof res === "object" && "data" in res) {
        return (res as ApiWrapped<T>).data as T;
    }
    return res as T;
}

export type GeneratedText = {
    title?: string;
    body?: string;
    hashtags?: string[];
    callToAction?: string;
    tone?: string;
};

export type GeneratedImageInlineData = {
    mimeType?: string;
    data?: string; // base64 payload
};

export type GenerateTextResult = {
    generatedText: GeneratedText;
    evaluationScores?: unknown;
    status?: string;
    /** Set when AI history row was saved (Creative Lab Library). */
    historyId?: string | null;
};

export type GenerateImageTextResult = {
    generatedText: GeneratedText;
    generatedImage?: GeneratedImageInlineData | null;
    textScores?: unknown;
    imageScores?: unknown;
    status?: string;
    historyId?: string | null;
    /** Image step status (HF/Replicate chain; skipped when no HF/Rep tokens or both disabled). */
    imageGenerationStatus?:
        | "ok"
        | "skipped"
        | "unavailable"
        | "no_image_inline"
        | "quota_exceeded"
        | "error";
    imageMessage?: string;
};

export type GenerateVideoImagesTextResult = GenerateImageTextResult & {
    generatedVideo?: unknown;
    videoScores?: unknown;
    videoStatus?: string;
    message?: string;
};

export type AiContentHistoryItem = {
    id: string;
    prompt: string;
    contentType: string | null;
    generatedContent: string;
    createdAt: string;
    sourceIdea?: string | null;
    linkedProductId?: string | null;
    productTitle?: string | null;
    productImageUrl?: string | null;
    usedForId?: string | null;
    usedForType?: string | null;
};

export type AiHistoryListResult = {
    items: AiContentHistoryItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

/** Optional metadata persisted with AI history (Library cards). */
export type AiGenerateHistoryMeta = {
    sourceIdea?: string;
    linkedProductId?: string;
    productTitle?: string;
    productImageUrl?: string;
};

function historyBody(m?: AiGenerateHistoryMeta): Record<string, string> {
    if (!m) return {};
    const out: Record<string, string> = {};
    if (m.sourceIdea?.trim()) out.sourceIdea = m.sourceIdea.trim();
    if (m.linkedProductId?.trim()) out.linkedProductId = m.linkedProductId.trim();
    if (m.productTitle?.trim()) out.productTitle = m.productTitle.trim();
    if (m.productImageUrl?.trim()) out.productImageUrl = m.productImageUrl.trim();
    return out;
}

export const aiApi = {
    async patchHistoryLinkPost(
        historyId: string,
        postId: string,
        linkTarget: "post" | "scheduled_post" = "post",
    ): Promise<{ linked: boolean }> {
        const res = await httpClient.patch<ApiWrapped<{ linked: boolean }>>(
            `/ai/history/${encodeURIComponent(historyId)}/link-post`,
            { postId, linkTarget },
            { requiresAuth: true },
        );
        return unwrap(res);
    },

    async deleteHistory(historyId: string): Promise<{ deleted: boolean }> {
        const res = await httpClient.delete<ApiWrapped<{ deleted: boolean }>>(
            `/ai/history/${encodeURIComponent(historyId)}`,
            { requiresAuth: true },
        );
        return unwrap(res);
    },

    async getHistory(params?: {
        page?: number;
        limit?: number;
        filter?: "all" | "draft" | "scheduled" | "posted" | "completed";
        sort?: "desc" | "asc";
    }): Promise<AiHistoryListResult> {
        const search = new URLSearchParams();
        if (params?.page != null) search.set("page", String(params.page));
        if (params?.limit != null) search.set("limit", String(params.limit));
        if (params?.filter && params.filter !== "all") {
            search.set("filter", params.filter);
        }
        if (params?.sort && params.sort !== "desc") {
            search.set("sort", params.sort);
        }
        const q = search.toString();
        const path = q ? `/ai/history?${q}` : "/ai/history";
        const res = await httpClient.get<ApiWrapped<AiHistoryListResult>>(path, {
            requiresAuth: true,
        });
        return unwrap(res);
    },

    async generateText(
        payload: {
            description: string;
            tone?: string;
            imageBase64?: string | null;
            withHashtags?: boolean;
            withCta?: boolean;
            length?: "Short" | "Medium" | "Long";
        } & AiGenerateHistoryMeta,
    ): Promise<GenerateTextResult> {
        const res = await httpClient.post<ApiWrapped<GenerateTextResult>>(
            "/ai/generate-text",
            {
                description: payload.description,
                tone: payload.tone,
                imageBase64: payload.imageBase64 ?? null,
                withHashtags: payload.withHashtags ?? true,
                withCta: payload.withCta ?? true,
                length: payload.length ?? "Medium",
                ...historyBody({
                    sourceIdea: payload.sourceIdea,
                    linkedProductId: payload.linkedProductId,
                    productTitle: payload.productTitle,
                    productImageUrl: payload.productImageUrl,
                }),
            },
            { requiresAuth: true },
        );
        return unwrap(res);
    },

    async generateImageText(
        payload: {
            description: string;
            tone?: string;
            imageBase64?: string | null;
            withHashtags?: boolean;
            withCta?: boolean;
            length?: "Short" | "Medium" | "Long";
        } & AiGenerateHistoryMeta,
    ): Promise<GenerateImageTextResult> {
        const res = await httpClient.post<ApiWrapped<GenerateImageTextResult>>(
            "/ai/generate-image-text",
            {
                description: payload.description,
                tone: payload.tone,
                imageBase64: payload.imageBase64 ?? null,
                withHashtags: payload.withHashtags ?? true,
                withCta: payload.withCta ?? true,
                length: payload.length ?? "Medium",
                ...historyBody({
                    sourceIdea: payload.sourceIdea,
                    linkedProductId: payload.linkedProductId,
                    productTitle: payload.productTitle,
                    productImageUrl: payload.productImageUrl,
                }),
            },
            { requiresAuth: true },
        );
        return unwrap(res);
    },

    async generateVideoImagesText(
        payload: {
            description: string;
            tone?: string;
            imageBase64?: string | null;
            withHashtags?: boolean;
            withCta?: boolean;
            length?: "Short" | "Medium" | "Long";
        } & AiGenerateHistoryMeta,
    ): Promise<GenerateVideoImagesTextResult> {
        const res = await httpClient.post<
            ApiWrapped<GenerateVideoImagesTextResult>
        >(
            "/ai/generate-video-images-text",
            {
                description: payload.description,
                tone: payload.tone,
                imageBase64: payload.imageBase64 ?? null,
                withHashtags: payload.withHashtags ?? true,
                withCta: payload.withCta ?? true,
                length: payload.length ?? "Medium",
                ...historyBody({
                    sourceIdea: payload.sourceIdea,
                    linkedProductId: payload.linkedProductId,
                    productTitle: payload.productTitle,
                    productImageUrl: payload.productImageUrl,
                }),
            },
            { requiresAuth: true },
        );
        return unwrap(res);
    },
};

