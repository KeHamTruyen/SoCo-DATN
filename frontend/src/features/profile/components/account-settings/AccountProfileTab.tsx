import { useTranslation } from "react-i18next";
import { Label } from "../../../../shared/ui/atoms/label";
import { Input } from "../../../../shared/ui/atoms/input";
import { Button } from "../../../../shared/ui/atoms/button";
import type { useAccountProfileSettings } from "../../hooks/useAccountProfileSettings";

type ProfileSettingsHook = ReturnType<typeof useAccountProfileSettings>;

interface AccountProfileTabProps {
    profileState: ProfileSettingsHook;
    idPrefix?: string;
}

export function AccountProfileTab({ profileState, idPrefix = "" }: AccountProfileTabProps) {
    const { t } = useTranslation();
    const {
        fullName, setFullName,
        username, setUsername,
        bio, setBio,
        phone, setPhone,
        profileLoading,
        profileSaving,
        profileMessage,
        profileErr,
        saveProfile
    } = profileState;

    if (profileLoading) {
        return <p className="text-sm text-muted-foreground">{t("accountSettings.loading")}</p>;
    }

    return (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            {profileErr ? <p className="text-sm text-destructive">{profileErr}</p> : null}
            {profileMessage ? (
                <p className="text-sm text-green-600 dark:text-green-400">{profileMessage}</p>
            ) : null}
            <div>
                <Label htmlFor={`${idPrefix}fullName`}>{t("accountSettings.fullName")}</Label>
                <Input
                    id={`${idPrefix}fullName`}
                    className="mt-1.5"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
            </div>
            <div>
                <Label htmlFor={`${idPrefix}username`}>{t("accountSettings.username")}</Label>
                <Input
                    id={`${idPrefix}username`}
                    className="mt-1.5"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <Label htmlFor={`${idPrefix}bio`}>{t("accountSettings.bio")}</Label>
                <textarea
                    id={`${idPrefix}bio`}
                    rows={4}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
            </div>
            <div>
                <Label htmlFor={`${idPrefix}phone`}>{t("accountSettings.phone")}</Label>
                <Input
                    id={`${idPrefix}phone`}
                    className="mt-1.5"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
            <Button type="button" disabled={profileSaving} onClick={() => void saveProfile()}>
                {profileSaving ? t("accountSettings.saving") : t("accountSettings.saveProfile")}
            </Button>
        </div>
    );
}
