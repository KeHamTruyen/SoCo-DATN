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
        get2FAStatus: vi.fn(),
        enable2FA: vi.fn(),
        confirm2FAEnable: vi.fn(),
        disable2FA: vi.fn(),
    },
}));

import { useAccountSecuritySettings } from "../useAccountSecuritySettings";

describe("useAccountSecuritySettings", () => {
    it("should initialize default state correctly", () => {
        const { result } = renderHook(() => useAccountSecuritySettings("settings"));
        expect(result.current.twoFAEnabled).toBe(false);
        expect(result.current.enableStep).toBe("idle");
        expect(result.current.disableStep).toBe("idle");
        expect(result.current.twoFAErr).toBeNull();
    });
});
