import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock dependencies
vi.mock("../../feed/api/feedApi", () => ({
    feedApi: {
        createPost: vi.fn(),
        createScheduledPost: vi.fn(),
    },
}));

vi.mock("../../upload/api/uploadApi", () => ({
    uploadApi: {
        uploadPostMedia: vi.fn(),
    },
}));

import { useAiStudioPublisher } from "../useAiStudioPublisher";

describe("useAiStudioPublisher", () => {
    const defaultProps = {
        mode: "text" as const,
        generated: null,
        hasDraftText: false,
        outputHtmlRef: { current: "" },
        outputPlainTextRef: { current: "" },
        length: "Medium",
        withHashtags: true,
        withCta: true,
        canLinkProduct: true,
        selectedProduct: null,
        resetPageState: vi.fn(),
    };

    it("should initialize default states", () => {
        const { result } = renderHook(() => useAiStudioPublisher(defaultProps));
        expect(result.current.scheduleModalOpen).toBe(false);
        expect(result.current.successModal).toBe("none");
        expect(result.current.postActionBusy).toBe(false);
    });

    it("should not be postable if no draft text", () => {
        const { result } = renderHook(() => useAiStudioPublisher(defaultProps));
        expect(result.current.hasPostableContent).toBe(false);
    });

    it("should be postable if draft text exists", () => {
        const { result } = renderHook(() => useAiStudioPublisher({ ...defaultProps, hasDraftText: true }));
        expect(result.current.hasPostableContent).toBe(true);
    });
});
