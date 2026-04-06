import { useTranslation } from "react-i18next";
import { ShieldCheck, ShieldOff, KeyRound, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import { Label } from "../../../../shared/ui/atoms/label";
import { Input } from "../../../../shared/ui/atoms/input";
import { Button } from "../../../../shared/ui/atoms/button";
import { cn } from "../../../../shared/lib/cn";
import type { useAccountSecuritySettings } from "../../hooks/useAccountSecuritySettings";

type SecuritySettingsHook = ReturnType<typeof useAccountSecuritySettings>;

interface AccountSecurityTabProps {
    securityState: SecuritySettingsHook;
    idPrefix?: string;
}

export function AccountSecurityTab({ securityState, idPrefix = "" }: AccountSecurityTabProps) {
    const { t } = useTranslation();
    const {
        twoFAEnabled,
        twoFALoading,
        twoFABusy,
        twoFAMessage, setTwoFAMessage,
        twoFAErr, setTwoFAErr,
        enableStep, setEnableStep,
        otpCode, setOtpCode,
        backupCodes, setBackupCodes,
        backupCopied,
        disableStep, setDisableStep,
        disablePassword, setDisablePassword,
        handleStartEnable,
        handleConfirmEnable,
        handleStartDisable,
        handleConfirmDisable,
        handleCopyBackupCodes
    } = securityState;

    if (twoFALoading) {
        return <p className="text-sm text-muted-foreground">{t("accountSettings.loading")}</p>;
    }

    return (
        <div className="space-y-6">
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

                {twoFAErr ? <p className="mb-3 text-sm text-destructive">{twoFAErr}</p> : null}
                {twoFAMessage ? (
                    <p className="mb-3 text-sm text-green-600 dark:text-green-400">{twoFAMessage}</p>
                ) : null}

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
            </div>
        </div>
    );
}
