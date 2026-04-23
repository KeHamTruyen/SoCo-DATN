import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { renderHook } from "@testing-library/react";
import { AiStudioProvider, useAiStudio } from "../AiStudioContext";

const authMocks = vi.hoisted(() => ({
    user: { id: "s1", role: "seller" as const, email: "s@s.com", fullName: "S" },
}));

vi.mock("../../../../shared/auth/useAuthSession", () => ({
    useAuthSession: () => ({ user: authMocks.user }),
}));

vi.mock("../../../marketplace/api/marketplaceApi", () => ({
    marketplaceApi: {
        listProducts: vi.fn().mockResolvedValue({ items: [] }),
    },
}));

describe("useAiStudio", () => {
    it("throws outside AiStudioProvider", () => {
        expect(() => {
            renderHook(() => useAiStudio());
        }).toThrow("useAiStudio must be used within an AiStudioProvider");
    });

    it("returns studio API inside provider", () => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
        });

        function Wrapper({ children }: { children: ReactNode }) {
            return createElement(
                MemoryRouter,
                null,
                createElement(
                    QueryClientProvider,
                    { client: queryClient },
                    createElement(AiStudioProvider, null, children),
                ),
            );
        }

        const { result } = renderHook(() => useAiStudio(), { wrapper: Wrapper });

        expect(result.current.form).toBeDefined();
        expect(typeof result.current.resetAll).toBe("function");
    });
});
