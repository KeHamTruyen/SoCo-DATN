import { useState, useCallback } from "react";
import { aiApi } from "../api/aiApi";
import type {
    GenerateImageTextResult,
    GenerateVideoImagesTextResult,
} from "../api/aiApi";

type ImagePayload = Parameters<typeof aiApi.generateImageText>[0];

export function useAiImageGeneration() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [data, setData] = useState<
        GenerateImageTextResult | GenerateVideoImagesTextResult | null
    >(null);
    const [error, setError] = useState<string | null>(null);

    const generateImageText = useCallback(
        async (payload: ImagePayload): Promise<GenerateImageTextResult> => {
            setError(null);
            setIsGenerating(true);
            try {
                const res = await aiApi.generateImageText(payload);
                setData(res);
                return res;
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : "Generation failed.";
                setError(msg);
                throw e;
            } finally {
                setIsGenerating(false);
            }
        },
        [],
    );

    const generateVideoImagesText = useCallback(
        async (
            payload: ImagePayload,
        ): Promise<GenerateVideoImagesTextResult> => {
            setError(null);
            setIsGenerating(true);
            try {
                const res = await aiApi.generateVideoImagesText(payload);
                setData(res);
                return res;
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : "Generation failed.";
                setError(msg);
                throw e;
            } finally {
                setIsGenerating(false);
            }
        },
        [],
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsGenerating(false);
    }, []);

    return {
        isGenerating,
        data,
        error,
        generateImageText,
        generateVideoImagesText,
        reset,
    };
}
