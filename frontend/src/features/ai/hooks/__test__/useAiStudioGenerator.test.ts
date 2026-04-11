import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("../useAiTextGeneration", () => ({
    useAiTextGeneration: () => ({
        generateText: vi.fn(),
        isGenerating: false,
        reset: vi.fn(),
    }),
}));

vi.mock("../useAiImageGeneration", () => ({
    useAiImageGeneration: () => ({
        generateImageText: vi.fn(),
        generateVideoImagesText: vi.fn(),
        isGenerating: false,
        reset: vi.fn(),
    }),
}));

import { useAiStudioGenerator } from "../useAiStudioGenerator";

describe("useAiStudioGenerator", () => {
    const defaultProps = {
        mode: "text" as const,
        prompt: "Test prompt",
        effectiveTone: "Excited",
        withHashtags: true,
        withCta: true,
        length: "Medium",
        canLinkProduct: true,
        selectedProduct: { title: "Product 1" },
        productQuery: "",
    };

    it("should initialize default state correctly", () => {
        const { result } = renderHook(() => useAiStudioGenerator(defaultProps));
        expect(result.current.isGenerating).toBe(false);
        expect(result.current.generated).toBeNull();
    });

    it("should report error if tone is missing", async () => {
        const { result } = renderHook(() =>
            useAiStudioGenerator({ ...defaultProps, effectiveTone: "" }),
        );
        await act(async () => {
            await result.current.handleGenerate();
        });
        expect(result.current.errorMessage).toBe("aiCreativeLab.errors.toneRequired");
    });
});
