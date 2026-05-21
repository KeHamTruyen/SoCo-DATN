import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    AccountSettingsPanel,
    type AccountSettingsTab,
} from "../features/profile/components/AccountSettingsPanel";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { useTranslation } from "react-i18next";

export default function AccountSettings() {
    const { user } = useAuthSession();
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const rawTab = searchParams.get("tab");
    const tab: AccountSettingsTab =
        rawTab === "privacy" ? "privacy" : rawTab === "settings" ? "settings" : "profile";

    const setTab = useCallback(
        (next: AccountSettingsTab) => {
            const nextParams = new URLSearchParams(searchParams);
            if (next === "profile") nextParams.delete("tab");
            else nextParams.set("tab", next);
            setSearchParams(nextParams, { replace: true });
        },
        [searchParams, setSearchParams],
    );

    if (!user) {
        return (
            <main className="mx-auto w-full max-w-2xl flex-1 p-8">
                <p className="text-muted-foreground">{t("accountSettings.signInRequired")}</p>
                <Link to="/login" className="mt-4 inline-block font-semibold text-primary">
                    {t("accountSettings.goToLogin")}
                </Link>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
            <h1 className="mb-6 text-2xl font-bold">{t("accountSettings.title")}</h1>
            <AccountSettingsPanel tab={tab} onTabChange={setTab} idPrefix="acc-page-" />
        </main>
    );
}
