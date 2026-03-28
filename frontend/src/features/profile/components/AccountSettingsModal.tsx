import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    AccountSettingsPanel,
    type AccountSettingsTab,
} from "./AccountSettingsPanel";

export interface AccountSettingsModalProps {
    open: boolean;
    onClose: () => void;
    initialTab?: AccountSettingsTab;
    onProfileSaveSuccess?: () => void | Promise<void>;
}

export function AccountSettingsModal({
    open,
    onClose,
    initialTab = "profile",
    onProfileSaveSuccess,
}: AccountSettingsModalProps) {
    const { t } = useTranslation();
    const [tab, setTab] = useState<AccountSettingsTab>(initialTab);

    useEffect(() => {
        if (open) setTab(initialTab);
    }, [open, initialTab]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
            <button
                type="button"
                className="absolute inset-0 bg-black/50"
                aria-label={t("accountSettings.closeModal")}
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="account-settings-modal-title"
                className="relative z-10 max-h-[min(90vh,720px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl"
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 id="account-settings-modal-title" className="text-xl font-bold text-foreground">
                        {t("accountSettings.title")}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={t("accountSettings.closeModal")}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <AccountSettingsPanel
                    tab={tab}
                    onTabChange={setTab}
                    onProfileSaveSuccess={onProfileSaveSuccess}
                    idPrefix="acc-modal-"
                />
            </div>
        </div>
    );
}
