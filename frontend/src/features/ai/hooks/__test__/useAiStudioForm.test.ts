import { renderHook, act } from "@testing-library/react";
import { useAiStudioForm } from "../useAiStudioForm";

describe("useAiStudioForm", () => {
    it("should initialize with default values", () => {
        const { result } = renderHook(() => useAiStudioForm());
        expect(result.current.mode).toBe("text");
        expect(result.current.prompt).toBe("");
        expect(result.current.toneMode).toBe("preset");
        expect(result.current.tonePreset).toBe("Excited");
        expect(result.current.length).toBe("Medium");
        expect(result.current.withHashtags).toBe(true);
        expect(result.current.withCta).toBe(true);
    });

    it("should update form values", () => {
        const { result } = renderHook(() => useAiStudioForm());
        act(() => {
            result.current.setPrompt("New prompt");
            result.current.setMode("image");
            result.current.setLength("Short");
        });
        expect(result.current.prompt).toBe("New prompt");
        expect(result.current.mode).toBe("image");
        expect(result.current.length).toBe("Short");
    });

    it("should reset form", () => {
        const { result } = renderHook(() => useAiStudioForm());
        act(() => {
            result.current.setPrompt("New prompt");
            result.current.setMode("image");
        });
        expect(result.current.prompt).toBe("New prompt");
        act(() => {
            result.current.resetForm();
        });
        expect(result.current.prompt).toBe("");
        expect(result.current.mode).toBe("text");
    });
});
