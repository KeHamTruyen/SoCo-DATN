import { useState, useCallback } from "react";
import { aiApi } from "../api/aiApi";
import type { GenerateTextResult } from "../api/aiApi";

export function useAiTextGeneration() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [data, setData] = useState<GenerateTextResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateText = useCallback(
        async (
            payload: Parameters<typeof aiApi.generateText>[0],
        ): Promise<GenerateTextResult> => {
            setError(null);
            setIsGenerating(true);
            try {
                const res = await aiApi.generateText(payload);
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
        generateText,
        reset,
    };
}
