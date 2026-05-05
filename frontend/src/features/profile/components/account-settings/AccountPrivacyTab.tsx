import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "../../../../shared/ui/atoms/label";
import { Button } from "../../../../shared/ui/atoms/button";
import { Avatar } from "../../../../shared/ui/atoms/avatar";
import { blockApi } from "../../../block/api/blockApi";
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

    const [blockedUsers, setBlockedUsers] = useState<Array<{
        id: string;
        username?: string;
        fullName?: string;
        avatarUrl?: string;
        blockedAt?: string;
    }>>([]);
    const [blockedLoading, setBlockedLoading] = useState(true);
    const [blockedError, setBlockedError] = useState<string | null>(null);
    const [blockedBusyId, setBlockedBusyId] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const rows = await blockApi.list();
                if (active) setBlockedUsers(rows ?? []);
            } catch (error) {
                if (active) setBlockedError((error as Error).message || "Failed to load blocked users");
            } finally {
                if (active) setBlockedLoading(false);
            }
        };
        void load();
        return () => {
            active = false;
        };
    }, []);

    const handleUnblock = async (userId: string) => {
        setBlockedBusyId(userId);
        setBlockedError(null);
        try {
            await blockApi.unblock(userId);
            setBlockedUsers((prev) => prev.filter((row) => row.id !== userId));
        } catch (error) {
            setBlockedError((error as Error).message || "Failed to unblock user");
        } finally {
            setBlockedBusyId(null);
        }
    };

    if (privacyLoading || !privacy) {
        return <p className="text-sm text-muted-foreground">{t("accountSettings.loading")}</p>;
    }

    return (
        <div className="space-y-6">
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

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-foreground">Blocked users</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage people you have blocked.
                    </p>
                </div>

                {blockedError ? (
                    <p className="mb-3 text-sm text-destructive">{blockedError}</p>
                ) : null}

                {blockedLoading ? (
                    <p className="text-sm text-muted-foreground">Loading blocked users...</p>
                ) : blockedUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">You have not blocked anyone.</p>
                ) : (
                    <div className="space-y-3">
                        {blockedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar src={user.avatarUrl} alt={user.fullName || user.username || "User"} />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {user.fullName || user.username || "Unknown user"}
                                        </p>
                                        {user.username ? (
                                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                                        ) : null}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={blockedBusyId === user.id}
                                    onClick={() => void handleUnblock(user.id)}
                                >
                                    {blockedBusyId === user.id ? "Unblocking..." : "Unblock"}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
