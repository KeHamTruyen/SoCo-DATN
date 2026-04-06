import { useState, useEffect } from "react";
import { authApi } from "../../auth/api/authApi";
import type { PrivacySettings } from "../../auth/types/auth.types";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { useTranslation } from "react-i18next";

export function useAccountPrivacySettings(tab: string) {
    const { user } = useAuthSession();
    const { t } = useTranslation();

    const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
    const [privacyLoading, setPrivacyLoading] = useState(false);
    const [privacySaving, setPrivacySaving] = useState(false);
    const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);
    const [privacyErr, setPrivacyErr] = useState<string | null>(null);

    useEffect(() => {
        if (tab !== "privacy" || !user?.id) return;
        let cancelled = false;
        void (async () => {
            setPrivacyLoading(true);
            setPrivacyErr(null);
            try {
                const s = await authApi.getPrivacy();
                if (!cancelled) setPrivacy(s);
            } catch {
                if (!cancelled) setPrivacyErr(t("accountSettings.loadError"));
            } finally {
                if (!cancelled) setPrivacyLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [tab, user?.id, t]);

    const savePrivacy = async () => {
        if (!privacy) return;
        setPrivacySaving(true);
        setPrivacyErr(null);
        setPrivacyMessage(null);
        try {
            const updated = await authApi.updatePrivacy(privacy);
            setPrivacy(updated);
            setPrivacyMessage(t("accountSettings.privacySaved"));
        } catch (e) {
            setPrivacyErr(e instanceof Error ? e.message : t("accountSettings.saveError"));
        } finally {
            setPrivacySaving(false);
        }
    };

    return {
        privacy, setPrivacy,
        privacyLoading,
        privacySaving,
        privacyMessage,
        privacyErr,
        savePrivacy
    };
}
