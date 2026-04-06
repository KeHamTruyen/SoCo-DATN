import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { uploadApi } from "../../upload/api/uploadApi";
import { profileApi } from "../api/profileApi";
import type { PublicUserProfile } from "../types/profile.types";

export function useProfileMedia(
    profile: PublicUserProfile | null,
    setProfile: React.Dispatch<React.SetStateAction<PublicUserProfile | null>>,
    refreshProfile: () => Promise<void>
) {
    const { t } = useTranslation();
    const [profileMediaBusy, setProfileMediaBusy] = useState(false);
    const [profileMediaError, setProfileMediaError] = useState<string | null>(null);

    const handleAvatarFile = useCallback(
        async (file: File) => {
            if (!profile) return;
            setProfileMediaError(null);
            setProfileMediaBusy(true);
            try {
                const { url } = await uploadApi.uploadAvatar(file);
                await profileApi.updateProfile({ avatarUrl: url });
                await refreshProfile();
                setProfile((p) => (p ? { ...p, avatarUrl: url } : p));
            } catch (e) {
                setProfileMediaError(
                    e instanceof Error ? e.message : t("profile.uploadError")
                );
            } finally {
                setProfileMediaBusy(false);
            }
        },
        [profile, refreshProfile, t, setProfile]
    );

    const handleCoverFile = useCallback(
        async (file: File) => {
            if (!profile) return;
            setProfileMediaError(null);
            setProfileMediaBusy(true);
            try {
                const { url } = await uploadApi.uploadPostMedia(file);
                await profileApi.updateProfile({ coverImage: url });
                await refreshProfile();
                setProfile((p) =>
                    p ? { ...p, coverImage: url, coverUrl: url } : p
                );
            } catch (e) {
                setProfileMediaError(
                    e instanceof Error ? e.message : t("profile.uploadError")
                );
            } finally {
                setProfileMediaBusy(false);
            }
        },
        [profile, refreshProfile, t, setProfile]
    );

    return {
        profileMediaBusy,
        profileMediaError,
        handleAvatarFile,
        handleCoverFile
    };
}
