import { useEffect, useState } from "react";
import { authApi } from "../../auth/api/authApi";
import type { PrivacySettings } from "../../auth/types/auth.types";
import { profileApi } from "../api/profileApi";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { cn } from "../../../shared/lib/cn";
import { Button } from "../../../shared/ui/atoms/button";
import { Input } from "../../../shared/ui/atoms/input";
import { Label } from "../../../shared/ui/atoms/label";
import { useTranslation } from "react-i18next";

export type AccountSettingsTab = "profile" | "privacy";

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

    const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
    const [privacyLoading, setPrivacyLoading] = useState(false);
    const [privacySaving, setPrivacySaving] = useState(false);
    const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);
    const [privacyErr, setPrivacyErr] = useState<string | null>(null);

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
            await onProfileSaveSuccess?.();
        } catch (e) {
            setProfileErr(e instanceof Error ? e.message : t("accountSettings.saveError"));
        } finally {
            setProfileSaving(false);
        }
    };

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
            </div>

            {tab === "profile" ? (
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    {profileLoading ? (
                        <p className="text-sm text-muted-foreground">{t("accountSettings.loading")}</p>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    {privacyLoading || !privacy ? (
                        <p className="text-sm text-muted-foreground">{t("accountSettings.loading")}</p>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
