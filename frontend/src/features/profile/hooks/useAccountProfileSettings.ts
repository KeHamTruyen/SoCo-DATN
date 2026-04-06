import { useState, useEffect } from "react";
import { profileApi } from "../../profile/api/profileApi";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { useTranslation } from "react-i18next";

export function useAccountProfileSettings(onSaveSuccess?: () => void | Promise<void>) {
    const { user, refreshProfile } = useAuthSession();
    const { t } = useTranslation();

    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [phone, setPhone] = useState("");
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState<string | null>(null);
    const [profileErr, setProfileErr] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        const uid = user.id;
        let cancelled = false;
        void (async () => {
            setProfileLoading(true);
            setProfileErr(null);
            try {
                const p = await profileApi.getProfile(uid);
                if (cancelled) return;
                setFullName(p.fullName ?? "");
                setUsername(p.username ?? "");
                setBio(p.bio ?? "");
                setPhone(p.phone ?? "");
            } catch {
                if (!cancelled) setProfileErr(t("accountSettings.loadError"));
            } finally {
                if (!cancelled) setProfileLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user?.id, t]);

    const saveProfile = async () => {
        if (!user) return;
        setProfileSaving(true);
        setProfileErr(null);
        setProfileMessage(null);
        try {
            await profileApi.updateProfile({
                fullName: fullName.trim() || undefined,
                username: username.trim() || undefined,
                bio: bio.trim() || undefined,
                phone: phone.trim() || undefined,
            });
            await refreshProfile();
            setProfileMessage(t("accountSettings.profileSaved"));
            await onSaveSuccess?.();
        } catch (e) {
            setProfileErr(e instanceof Error ? e.message : t("accountSettings.saveError"));
        } finally {
            setProfileSaving(false);
        }
    };

    return {
        fullName, setFullName,
        username, setUsername,
        bio, setBio,
        phone, setPhone,
        profileLoading,
        profileSaving,
        profileMessage,
        profileErr,
        saveProfile
    };
}
