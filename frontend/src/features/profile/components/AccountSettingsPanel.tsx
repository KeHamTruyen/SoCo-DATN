import { ShieldCheck, ShieldOff, KeyRound, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
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
    const { user, refreshProfile } = useAuthSession();
    const { t } = useTranslation();

    // ─── Profile tab state ─────────────────────────────────────
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [phone, setPhone] = useState("");
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState<string | null>(null);
    const [profileErr, setProfileErr] = useState<string | null>(null);

    // ─── Privacy tab state ─────────────────────────────────────
    const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
    const [privacyLoading, setPrivacyLoading] = useState(false);
    const [privacySaving, setPrivacySaving] = useState(false);
    const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);
    const [privacyErr, setPrivacyErr] = useState<string | null>(null);

    // ─── Settings / 2FA state ──────────────────────────────────
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [twoFABusy, setTwoFABusy] = useState(false);
    const [twoFAMessage, setTwoFAMessage] = useState<string | null>(null);
    const [twoFAErr, setTwoFAErr] = useState<string | null>(null);
    // Enable flow
    const [enableStep, setEnableStep] = useState<"idle" | "otp" | "backup">("idle");
    const [otpCode, setOtpCode] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [backupCopied, setBackupCopied] = useState(false);
    // Disable flow
    const [disableStep, setDisableStep] = useState<"idle" | "password">("idle");
    const [disablePassword, setDisablePassword] = useState("");

    // ─── Load profile ──────────────────────────────────────────
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

    // ─── Load privacy ──────────────────────────────────────────
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

    // ─── Load 2FA status ───────────────────────────────────────
    useEffect(() => {
        if (tab !== "settings" || !user?.id) return;
        let cancelled = false;
        void (async () => {
            setTwoFALoading(true);
            setTwoFAErr(null);
            try {
                const res = await authApi.get2FAStatus();
                if (!cancelled) setTwoFAEnabled(res.isEnabled);
            } catch {
                if (!cancelled) setTwoFAErr(t("accountSettings.loadError"));
            } finally {
                if (!cancelled) setTwoFALoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [tab, user?.id, t]);

    // ─── Save profile ──────────────────────────────────────────
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

    // ─── Save privacy ──────────────────────────────────────────
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

    // ─── 2FA Enable flow ───────────────────────────────────────
    const handleStartEnable = async () => {
        setTwoFABusy(true);
        setTwoFAErr(null);
        setTwoFAMessage(null);
        try {
            const res = await authApi.enable2FA();
            setBackupCodes(res.backupCodes);
            setTwoFAMessage(t("accountSettings.otpSent"));
            setEnableStep("otp");
        } catch (e) {
            setTwoFAErr(e instanceof Error ? e.message : t("accountSettings.saveError"));
        } finally {
            setTwoFABusy(false);
        }
    };

    const handleConfirmEnable = async () => {
        if (!otpCode.trim()) return;
        setTwoFABusy(true);
        setTwoFAErr(null);
        try {
            const res = await authApi.confirm2FAEnable(otpCode.trim());
            setBackupCodes(res.backupCodes);
            setTwoFAEnabled(true);
            setTwoFAMessage(t("accountSettings.twoFactorEnabledSuccess"));
            setEnableStep("backup");
            setOtpCode("");
        } catch (e) {
            setTwoFAErr(e instanceof Error ? e.message : t("accountSettings.saveError"));
        } finally {
            setTwoFABusy(false);
        }
    };

    // ─── 2FA Disable flow ──────────────────────────────────────
    const handleStartDisable = () => {
        setDisableStep("password");
        setDisablePassword("");
        setTwoFAErr(null);
        setTwoFAMessage(null);
    };

    const handleConfirmDisable = async () => {
        if (!disablePassword.trim()) return;
        setTwoFABusy(true);
        setTwoFAErr(null);
        try {
            await authApi.disable2FA(disablePassword.trim());
            setTwoFAEnabled(false);
            setTwoFAMessage(t("accountSettings.twoFactorDisabledSuccess"));
            setDisableStep("idle");
            setDisablePassword("");
        } catch (e) {
            setTwoFAErr(e instanceof Error ? e.message : t("accountSettings.saveError"));
        } finally {
            setTwoFABusy(false);
        }
    };

    const handleCopyBackupCodes = async () => {
        try {
            await navigator.clipboard.writeText(backupCodes.join("\n"));
            setBackupCopied(true);
            setTimeout(() => setBackupCopied(false), 2500);
        } catch { /* ignore */ }
    };

    // ─── Tab styling ───────────────────────────────────────────
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

            {/* ───── Profile Tab ───── */}
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

            /* ───── Privacy Tab ───── */
            ) : tab === "privacy" ? (
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

            /* ───── Settings Tab (2FA) ───── */
            ) : (
                <div className="space-y-6">
                    {/* 2FA Section */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-start gap-3">
                            <div className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                twoFAEnabled
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                            )}>
                                {twoFAEnabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-semibold text-foreground">
                                    {t("accountSettings.twoFactorAuth")}
                                </h3>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    {t("accountSettings.twoFactorDesc")}
                                </p>
                            </div>
                        </div>

                        {twoFALoading ? (
                            <p className="text-sm text-muted-foreground">{t("accountSettings.loading")}</p>
                        ) : (
                            <>
                                {/* Status badge */}
                                <div className={cn(
                                    "mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
                                    twoFAEnabled
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                )}>
                                    {twoFAEnabled ? (
                                        <><CheckCircle2 className="h-3.5 w-3.5" /> {t("accountSettings.twoFactorEnabled")}</>
                                    ) : (
                                        <><AlertTriangle className="h-3.5 w-3.5" /> {t("accountSettings.twoFactorDisabled")}</>
                                    )}
                                </div>

                                {/* Messages */}
                                {twoFAErr ? <p className="mb-3 text-sm text-destructive">{twoFAErr}</p> : null}
                                {twoFAMessage ? (
                                    <p className="mb-3 text-sm text-green-600 dark:text-green-400">{twoFAMessage}</p>
                                ) : null}

                                {/* ── Enable flow ── */}
                                {!twoFAEnabled && enableStep === "idle" && disableStep === "idle" ? (
                                    <Button
                                        type="button"
                                        disabled={twoFABusy}
                                        onClick={() => void handleStartEnable()}
                                        className="gap-2"
                                    >
                                        <KeyRound className="h-4 w-4" />
                                        {twoFABusy ? t("accountSettings.saving") : t("accountSettings.enable2FA")}
                                    </Button>
                                ) : null}

                                {!twoFAEnabled && enableStep === "otp" ? (
                                    <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                                        <Label htmlFor={`${idPrefix}otp-code`}>{t("accountSettings.enterOtp")}</Label>
                                        <Input
                                            id={`${idPrefix}otp-code`}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="font-mono text-center text-lg tracking-[0.3em]"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                disabled={twoFABusy || !otpCode.trim()}
                                                onClick={() => void handleConfirmEnable()}
                                            >
                                                {twoFABusy ? t("accountSettings.saving") : t("accountSettings.confirmOtp")}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => { setEnableStep("idle"); setOtpCode(""); setTwoFAErr(null); setTwoFAMessage(null); }}
                                            >
                                                {t("accountSettings.cancel")}
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}

                                {/* Backup codes after successful enable */}
                                {enableStep === "backup" && backupCodes.length > 0 ? (
                                    <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                        <div className="flex items-center gap-2">
                                            <KeyRound className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                                {t("accountSettings.backupCodes")}
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            {t("accountSettings.backupCodesDesc")}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            {backupCodes.map((code, i) => (
                                                <code
                                                    key={i}
                                                    className="rounded-lg border border-green-200 bg-white px-2 py-1.5 text-center text-xs font-mono text-green-800 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300"
                                                >
                                                    {code}
                                                </code>
                                            ))}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => void handleCopyBackupCodes()}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                            {backupCopied ? t("accountSettings.copied") : t("accountSettings.copyBackupCodes")}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="ml-2"
                                            onClick={() => { setEnableStep("idle"); setBackupCodes([]); }}
                                        >
                                            {t("accountSettings.done")}
                                        </Button>
                                    </div>
                                ) : null}

                                {/* ── Disable flow ── */}
                                {twoFAEnabled && disableStep === "idle" && enableStep === "idle" ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={twoFABusy}
                                        onClick={handleStartDisable}
                                        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                                    >
                                        <ShieldOff className="h-4 w-4" />
                                        {t("accountSettings.disable2FA")}
                                    </Button>
                                ) : null}

                                {twoFAEnabled && disableStep === "password" ? (
                                    <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                                        <Label htmlFor={`${idPrefix}disable-password`}>{t("accountSettings.enterPassword")}</Label>
                                        <Input
                                            id={`${idPrefix}disable-password`}
                                            type="password"
                                            value={disablePassword}
                                            onChange={(e) => setDisablePassword(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                disabled={twoFABusy || !disablePassword.trim()}
                                                onClick={() => void handleConfirmDisable()}
                                            >
                                                {twoFABusy ? t("accountSettings.saving") : t("accountSettings.confirmDisable")}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => { setDisableStep("idle"); setDisablePassword(""); setTwoFAErr(null); setTwoFAMessage(null); }}
                                            >
                                                {t("accountSettings.cancel")}
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
