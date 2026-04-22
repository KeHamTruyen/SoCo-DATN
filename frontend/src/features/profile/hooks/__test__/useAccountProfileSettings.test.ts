import { renderHook } from "@testing-library/react";

// Mock the react-i18next hook before importing the hook to be tested
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock the auth session
vi.mock("../../../../shared/auth/useAuthSession", () => ({
    useAuthSession: () => ({
        user: null,
        refreshProfile: vi.fn(),
    }),
}));

// Mock the api
vi.mock("../../../profile/api/profileApi", () => ({
    profileApi: {
        getProfile: vi.fn(),
        updateProfile: vi.fn(),
    },
}));

import { useAccountProfileSettings } from "../useAccountProfileSettings";

describe("useAccountProfileSettings", () => {
    it("should initialize with empty data", () => {
        const { result } = renderHook(() => useAccountProfileSettings());
        expect(result.current.fullName).toBe("");
        expect(result.current.username).toBe("");
        expect(result.current.bio).toBe("");
        expect(result.current.phone).toBe("");
        expect(result.current.profileLoading).toBe(true);
    });
});
