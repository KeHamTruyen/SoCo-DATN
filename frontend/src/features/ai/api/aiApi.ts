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
};

export type GenerateImageTextResult = {
    generatedText: GeneratedText;
    generatedImage?: GeneratedImageInlineData | null;
    textScores?: unknown;
    imageScores?: unknown;
    status?: string;
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

export const aiApi = {
    async generateText(payload: {
        description: string;
        tone?: string;
        imageBase64?: string | null;
        withHashtags?: boolean;
        withCta?: boolean;
        length?: "Short" | "Medium" | "Long";
    }): Promise<GenerateTextResult> {
        const res = await httpClient.post<ApiWrapped<GenerateTextResult>>(
            "/ai/generate-text",
            {
                description: payload.description,
                tone: payload.tone,
                imageBase64: payload.imageBase64 ?? null,
                withHashtags: payload.withHashtags ?? true,
                withCta: payload.withCta ?? true,
                length: payload.length ?? "Medium",
            },
            { requiresAuth: true },
        );
        return unwrap(res);
    },

    async generateImageText(payload: {
        description: string;
        tone?: string;
        imageBase64?: string | null;
        withHashtags?: boolean;
        withCta?: boolean;
        length?: "Short" | "Medium" | "Long";
    }): Promise<GenerateImageTextResult> {
        const res = await httpClient.post<ApiWrapped<GenerateImageTextResult>>(
            "/ai/generate-image-text",
            {
                description: payload.description,
                tone: payload.tone,
                imageBase64: payload.imageBase64 ?? null,
                withHashtags: payload.withHashtags ?? true,
                withCta: payload.withCta ?? true,
                length: payload.length ?? "Medium",
            },
            { requiresAuth: true },
        );
        return unwrap(res);
    },

    async generateVideoImagesText(payload: {
        description: string;
        tone?: string;
        imageBase64?: string | null;
        withHashtags?: boolean;
        withCta?: boolean;
        length?: "Short" | "Medium" | "Long";
    }): Promise<GenerateVideoImagesTextResult> {
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
            },
            { requiresAuth: true },
        );
        return unwrap(res);
    },
};

