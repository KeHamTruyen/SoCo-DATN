import { useState, useEffect } from "react";
import { authApi } from "../../auth/api/authApi";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { useTranslation } from "react-i18next";

export function useAccountSecuritySettings(tab: string) {
    const { user } = useAuthSession();
    const { t } = useTranslation();

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

    return {
        twoFAEnabled,
        twoFALoading,
        twoFABusy,
        twoFAMessage, setTwoFAMessage,
        twoFAErr, setTwoFAErr,

        enableStep, setEnableStep,
        otpCode, setOtpCode,
        backupCodes, setBackupCodes,
        backupCopied, setBackupCopied,

        disableStep, setDisableStep,
        disablePassword, setDisablePassword,

        handleStartEnable,
        handleConfirmEnable,
        handleStartDisable,
        handleConfirmDisable,
        handleCopyBackupCodes
    };
}
