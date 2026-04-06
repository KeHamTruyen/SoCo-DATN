import { useTranslation } from "react-i18next";
import { Label } from "../../../../shared/ui/atoms/label";
import { Button } from "../../../../shared/ui/atoms/button";
import type { PrivacySettings } from "../../../auth/types/auth.types";
import type { useAccountPrivacySettings } from "../../hooks/useAccountPrivacySettings";

type PrivacySettingsHook = ReturnType<typeof useAccountPrivacySettings>;

interface AccountPrivacyTabProps {
    privacyState: PrivacySettingsHook;
    idPrefix?: string;
}

export function AccountPrivacyTab({ privacyState, idPrefix = "" }: AccountPrivacyTabProps) {
    const { t } = useTranslation();
    const {
        privacy, setPrivacy,
        privacyLoading,
        privacySaving,
        privacyMessage,
        privacyErr,
        savePrivacy
    } = privacyState;

    if (privacyLoading || !privacy) {
        return <p className="text-sm text-muted-foreground">{t("accountSettings.loading")}</p>;
    }

    return (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            {privacyErr ? <p className="text-sm text-destructive">{privacyErr}</p> : null}
            {privacyMessage ? (
                <p className="text-sm text-green-600 dark:text-green-400">{privacyMessage}</p>
            ) : null}
            <div>
                <Label htmlFor={`${idPrefix}profileVisibility`}>
                    {t("accountSettings.profileVisibility")}
                </Label>
                <select
                    id={`${idPrefix}profileVisibility`}
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    value={privacy.profileVisibility}
                    onChange={(e) =>
                        setPrivacy({
                            ...privacy,
                            profileVisibility: e.target
                                .value as PrivacySettings["profileVisibility"],
                        })
                    }
                >
                    <option value="public">{t("accountSettings.visibilityPublic")}</option>
                    <option value="followers">{t("accountSettings.visibilityFollowers")}</option>
                    <option value="private">{t("accountSettings.visibilityPrivate")}</option>
                </select>
            </div>
            <div>
                <Label htmlFor={`${idPrefix}postVisibility`}>{t("accountSettings.postVisibility")}</Label>
                <select
                    id={`${idPrefix}postVisibility`}
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    value={privacy.postVisibility}
                    onChange={(e) =>
                        setPrivacy({
                            ...privacy,
                            postVisibility: e.target.value as PrivacySettings["postVisibility"],
                        })
                    }
                >
                    <option value="public">{t("accountSettings.visibilityPublic")}</option>
                    <option value="followers">{t("accountSettings.visibilityFollowers")}</option>
                    <option value="private">{t("accountSettings.visibilityPrivate")}</option>
                </select>
            </div>
            <div>
                <Label htmlFor={`${idPrefix}messagePermission`}>
                    {t("accountSettings.messagePermission")}
                </Label>
                <select
                    id={`${idPrefix}messagePermission`}
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    value={privacy.messagePermission}
                    onChange={(e) =>
                        setPrivacy({
                            ...privacy,
                            messagePermission: e.target
                                .value as PrivacySettings["messagePermission"],
                        })
                    }
                >
                    <option value="everyone">{t("accountSettings.messageEveryone")}</option>
                    <option value="followers">{t("accountSettings.messageFollowers")}</option>
                    <option value="nobody">{t("accountSettings.messageNobody")}</option>
                </select>
            </div>
            <Button type="button" disabled={privacySaving} onClick={() => void savePrivacy()}>
                {privacySaving ? t("accountSettings.saving") : t("accountSettings.savePrivacy")}
            </Button>
        </div>
    );
}
