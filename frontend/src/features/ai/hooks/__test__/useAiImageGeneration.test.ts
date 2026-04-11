import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAiImageGeneration } from "../useAiImageGeneration";

vi.mock("../../api/aiApi", () => ({
    aiApi: {
        generateImageText: vi.fn(),
        generateVideoImagesText: vi.fn(),
    },
}));

import { aiApi } from "../../api/aiApi";

describe("useAiImageGeneration", () => {
    beforeEach(() => {
        vi.mocked(aiApi.generateImageText).mockReset();
        vi.mocked(aiApi.generateVideoImagesText).mockReset();
    });

    it("generateImageText returns data", async () => {
        const mockResult = { generatedText: {}, imageGenerationStatus: "skipped" };
        vi.mocked(aiApi.generateImageText).mockResolvedValue(mockResult as never);

        const { result } = renderHook(() => useAiImageGeneration());

        await act(async () => {
            const out = await result.current.generateImageText({
                description: "d",
                tone: "Friendly",
            });
            expect(out).toEqual(mockResult);
        });

        expect(result.current.data).toEqual(mockResult);
    });

    it("generateVideoImagesText returns data", async () => {
        const mockResult = { generatedText: {}, videoStatus: "unavailable" };
        vi.mocked(aiApi.generateVideoImagesText).mockResolvedValue(mockResult as never);

        const { result } = renderHook(() => useAiImageGeneration());

        await act(async () => {
            await result.current.generateVideoImagesText({
                description: "d",
                tone: "Friendly",
            });
        });

        expect(result.current.data).toEqual(mockResult);
    });
});
