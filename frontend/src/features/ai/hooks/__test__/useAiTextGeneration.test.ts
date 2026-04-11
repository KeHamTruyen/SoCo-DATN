import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAiTextGeneration } from "../useAiTextGeneration";

vi.mock("../../api/aiApi", () => ({
    aiApi: {
        generateText: vi.fn(),
    },
}));

import { aiApi } from "../../api/aiApi";

describe("useAiTextGeneration", () => {
    beforeEach(() => {
        vi.mocked(aiApi.generateText).mockReset();
    });

    it("returns data on success", async () => {
        const mockResult = { generatedText: { title: "T" }, status: "approved" };
        vi.mocked(aiApi.generateText).mockResolvedValue(mockResult as never);

        const { result } = renderHook(() => useAiTextGeneration());

        await act(async () => {
            const out = await result.current.generateText({
                description: "test",
                tone: "Friendly",
            });
            expect(out).toEqual(mockResult);
        });

        expect(result.current.data).toEqual(mockResult);
        expect(result.current.error).toBeNull();
        expect(result.current.isGenerating).toBe(false);
    });

    it("sets error on failure", async () => {
        vi.mocked(aiApi.generateText).mockRejectedValue(new Error("network"));

        const { result } = renderHook(() => useAiTextGeneration());

        await act(async () => {
            try {
                await result.current.generateText({
                    description: "x",
                    tone: "Friendly",
                });
            } catch {
                /* expected */
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe("network");
        });
    });
});
