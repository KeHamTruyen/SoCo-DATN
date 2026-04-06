import { useTranslation } from "react-i18next";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { cn } from "../../../shared/lib/cn";
import { useAccountProfileSettings } from "../hooks/useAccountProfileSettings";
import { useAccountPrivacySettings } from "../hooks/useAccountPrivacySettings";
import { useAccountSecuritySettings } from "../hooks/useAccountSecuritySettings";
import { AccountProfileTab } from "./account-settings/AccountProfileTab";
import { AccountPrivacyTab } from "./account-settings/AccountPrivacyTab";
import { AccountSecurityTab } from "./account-settings/AccountSecurityTab";

export type AccountSettingsTab = "profile" | "privacy" | "settings";

export interface AccountSettingsPanelProps {
    tab: AccountSettingsTab;
    onTabChange: (tab: AccountSettingsTab) => void;
    /** Called after profile fields save + refreshProfile, so parent can refetch public profile */
    onProfileSaveSuccess?: () => void | Promise<void>;
    /** Prefix for form control ids (e.g. modal vs page) */
    idPrefix?: string;
    className?: string;
}

export function AccountSettingsPanel({
    tab,
    onTabChange,
    onProfileSaveSuccess,
    idPrefix = "",
    className,
}: AccountSettingsPanelProps) {
    const { user } = useAuthSession();
    const { t } = useTranslation();

    const profileState = useAccountProfileSettings(onProfileSaveSuccess);
    const privacyState = useAccountPrivacySettings(tab);
    const securityState = useAccountSecuritySettings(tab);

    const tabBtn = (active: boolean) =>
        cn(
            "px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px",
            active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
        );

    if (!user) {
        return (
            <p className="text-sm text-muted-foreground">{t("accountSettings.signInRequired")}</p>
        );
    }

    return (
        <div className={className}>
            <div className="mb-6 flex gap-2 border-b border-border">
                <button type="button" className={tabBtn(tab === "profile")} onClick={() => onTabChange("profile")}>
                    {t("accountSettings.profileTab")}
                </button>
                <button type="button" className={tabBtn(tab === "privacy")} onClick={() => onTabChange("privacy")}>
                    {t("accountSettings.privacyTab")}
                </button>
                <button type="button" className={tabBtn(tab === "settings")} onClick={() => onTabChange("settings")}>
                    {t("accountSettings.settingsTab")}
                </button>
            </div>

            {tab === "profile" && <AccountProfileTab profileState={profileState} idPrefix={idPrefix} />}
            {tab === "privacy" && <AccountPrivacyTab privacyState={privacyState} idPrefix={idPrefix} />}
            {tab === "settings" && <AccountSecurityTab securityState={securityState} idPrefix={idPrefix} />}
        </div>
    );
}
