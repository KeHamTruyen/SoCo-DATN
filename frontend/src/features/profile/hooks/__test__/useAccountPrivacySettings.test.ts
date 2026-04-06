import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

// Mock the react-i18next hook
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock the auth session
vi.mock("../../../../shared/auth/useAuthSession", () => ({
    useAuthSession: () => ({
        user: null, // Test unauthenticated
    }),
}));

// Mock the authApi
vi.mock("../../../auth/api/authApi", () => ({
    authApi: {
        getPrivacy: vi.fn(),
        updatePrivacy: vi.fn(),
    },
}));

import { useAccountPrivacySettings } from "../useAccountPrivacySettings";

describe("useAccountPrivacySettings", () => {
    it("should initialize without errors", () => {
        const { result } = renderHook(() => useAccountPrivacySettings("privacy"));
        expect(result.current.privacy).toBeNull();
        expect(result.current.privacyLoading).toBe(false); // null user means no loading triggered
        expect(result.current.privacySaving).toBe(false);
    });
});
