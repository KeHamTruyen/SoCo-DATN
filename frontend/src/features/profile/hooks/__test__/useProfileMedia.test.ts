import { renderHook, act, waitFor } from "@testing-library/react";
import { useProfileMedia } from "../useProfileMedia";
import { uploadApi } from "../../../upload/api/uploadApi";
import { profileApi } from "../../api/profileApi";
import type { PublicUserProfile } from "../../types/profile.types";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock("../../../upload/api/uploadApi", () => ({
    uploadApi: {
        uploadAvatar: vi.fn(),
        uploadPostMedia: vi.fn(),
    },
}));

vi.mock("../../api/profileApi", () => ({
    profileApi: {
        updateProfile: vi.fn(),
    },
}));

describe("useProfileMedia", () => {
    const profile: PublicUserProfile = {
        id: "u1",
        role: "buyer",
        fullName: "U",
    } as PublicUserProfile;

    const refreshProfile = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.mocked(uploadApi.uploadAvatar).mockReset();
        vi.mocked(uploadApi.uploadPostMedia).mockReset();
        vi.mocked(profileApi.updateProfile).mockReset();
        refreshProfile.mockClear();
    });

    it("handleAvatarFile uploads and updates profile", async () => {
        vi.mocked(uploadApi.uploadAvatar).mockResolvedValue({
            url: "https://cdn/a.jpg",
            publicId: "pub-1",
        });
        vi.mocked(profileApi.updateProfile).mockResolvedValue(undefined as never);
        const setProfile = vi.fn();

        const { result } = renderHook(() => useProfileMedia(profile, setProfile, refreshProfile));

        const file = new File(["x"], "a.png", { type: "image/png" });

        await act(async () => {
            await result.current.handleAvatarFile(file);
        });

        expect(uploadApi.uploadAvatar).toHaveBeenCalledWith(file);
        expect(profileApi.updateProfile).toHaveBeenCalledWith({ avatarUrl: "https://cdn/a.jpg" });
        expect(refreshProfile).toHaveBeenCalled();
        expect(setProfile).toHaveBeenCalled();
        await waitFor(() => expect(result.current.profileMediaBusy).toBe(false));
    });

    it("handleAvatarFile sets error when upload fails", async () => {
        vi.mocked(uploadApi.uploadAvatar).mockRejectedValue(new Error("bad"));
        const setProfile = vi.fn();

        const { result } = renderHook(() => useProfileMedia(profile, setProfile, refreshProfile));

        const file = new File(["x"], "a.png", { type: "image/png" });

        await act(async () => {
            await result.current.handleAvatarFile(file);
        });

        expect(result.current.profileMediaError).toBe("bad");
    });

    it("no-ops when profile is null", async () => {
        const setProfile = vi.fn();
        const { result } = renderHook(() => useProfileMedia(null, setProfile, refreshProfile));

        await act(async () => {
            await result.current.handleAvatarFile(new File(["x"], "a.png"));
        });

        expect(uploadApi.uploadAvatar).not.toHaveBeenCalled();
    });
});
