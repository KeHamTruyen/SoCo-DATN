import { createElement, type ReactNode } from "react";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useCreatePostFormState } from "../useCreatePostFormState";

const mockNavigate = vi.fn();

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock("../../../../shared/auth/useAuthSession", () => ({
    useAuthSession: () => ({
        user: {
            id: "me",
            fullName: "Me",
            username: "me",
            email: "m@m.com",
            role: "buyer" as const,
        },
    }),
}));

vi.mock("../../../auth/api/userApi", () => ({
    searchUsers: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../../marketplace/api/marketplaceApi", () => ({
    marketplaceApi: {
        listProducts: vi.fn().mockResolvedValue({ items: [] }),
    },
}));

import { marketplaceApi } from "../../../marketplace/api/marketplaceApi";

vi.mock("../../../upload/api/uploadApi", () => ({
    uploadApi: {
        uploadPostMedia: vi.fn(),
    },
}));

vi.mock("react-router-dom", async (importOriginal) => {
    const mod = await importOriginal<typeof import("react-router-dom")>();
    return {
        ...mod,
        useNavigate: () => mockNavigate,
    };
});

function wrapper({ children }: { children: ReactNode }) {
    return createElement(MemoryRouter, null, children);
}

describe("useCreatePostFormState", () => {
    beforeEach(() => {
        mockNavigate.mockReset();
    });

    it("canSubmit is false when body and media are empty", () => {
        const onClose = vi.fn();
        const onCreate = vi.fn().mockResolvedValue(undefined);
        const { result } = renderHook(
            () =>
                useCreatePostFormState({
                    onClose,
                    onCreate,
                }),
            { wrapper },
        );

        expect(result.current.canSubmit).toBe(false);
    });

    it("canSubmit true with non-empty rich content", () => {
        const onClose = vi.fn();
        const onCreate = vi.fn().mockResolvedValue(undefined);
        const { result } = renderHook(
            () =>
                useCreatePostFormState({
                    onClose,
                    onCreate,
                }),
            { wrapper },
        );

        act(() => {
            result.current.setContent("<p>Hello</p>");
        });

        expect(result.current.canSubmit).toBe(true);
    });

    it("handlePost calls onCreate with sanitized payload then onClose", async () => {
        const onClose = vi.fn();
        const onCreate = vi.fn().mockResolvedValue(undefined);
        const { result } = renderHook(
            () =>
                useCreatePostFormState({
                    onClose,
                    onCreate,
                    groupId: "g1",
                }),
            { wrapper },
        );

        act(() => {
            result.current.setContent("<p>Title</p>");
        });

        await act(async () => {
            await result.current.handlePost();
        });

        expect(onCreate).toHaveBeenCalledTimes(1);
        const payload = onCreate.mock.calls[0][0];
        expect(payload.content).toContain("Title");
        expect(payload.groupId).toBe("g1");
        expect(payload.visibility).toBe("PUBLIC");
        expect(onClose).toHaveBeenCalled();
    });

    it("openAiCreativeLab closes and navigates to AI lab", () => {
        const onClose = vi.fn();
        const onCreate = vi.fn();
        const { result } = renderHook(
            () =>
                useCreatePostFormState({
                    onClose,
                    onCreate,
                }),
            { wrapper },
        );

        act(() => {
            result.current.openAiCreativeLab();
        });

        expect(onClose).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/ai-creative-lab");
    });

    it("addTaggedUser ignores self and duplicates", () => {
        const onClose = vi.fn();
        const onCreate = vi.fn();
        const { result } = renderHook(
            () =>
                useCreatePostFormState({
                    onClose,
                    onCreate,
                }),
            { wrapper },
        );

        act(() => {
            result.current.addTaggedUser({ id: "me", fullName: "Self" });
        });
        expect(result.current.taggedUsers).toHaveLength(0);

        act(() => {
            result.current.addTaggedUser({ id: "u2", fullName: "Friend" });
        });
        act(() => {
            result.current.addTaggedUser({ id: "u2", fullName: "Friend" });
        });
        expect(result.current.taggedUsers).toHaveLength(1);
    });

    it("product search debounces and populates hits", async () => {
        vi.useFakeTimers();
        vi.mocked(marketplaceApi.listProducts).mockResolvedValue({
            items: [{ id: "p1", name: "Bag", price: 1, imageUrl: "", sellerId: "s" } as never],
        });

        const onClose = vi.fn();
        const onCreate = vi.fn();
        const { result } = renderHook(
            () =>
                useCreatePostFormState({
                    onClose,
                    onCreate,
                }),
            { wrapper },
        );

        act(() => {
            result.current.setToolPanel("product");
            result.current.setProductQuery("ba");
        });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(350);
        });

        expect(marketplaceApi.listProducts).toHaveBeenCalled();
        expect(result.current.productHits.length).toBeGreaterThan(0);

        vi.useRealTimers();
    });
});
