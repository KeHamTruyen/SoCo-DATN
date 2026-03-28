import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    AccountSettingsPanel,
    type AccountSettingsTab,
} from "../features/profile/components/AccountSettingsPanel";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { UnifiedHeader } from "../shared/ui";
import { useTranslation } from "react-i18next";

export default function AccountSettings() {
    const { user } = useAuthSession();
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab: AccountSettingsTab =
        searchParams.get("tab") === "privacy" ? "privacy" : "profile";

    const setTab = useCallback(
        (next: AccountSettingsTab) => {
            const nextParams = new URLSearchParams(searchParams);
            if (next === "privacy") nextParams.set("tab", "privacy");
            else nextParams.delete("tab");
            setSearchParams(nextParams, { replace: true });
        },
        [searchParams, setSearchParams],
    );

    if (!user) {
        return (
            <div className="flex min-h-0 flex-1 flex-col bg-background">
                <UnifiedHeader
                    navItems={[
                        { label: "Feed", to: "/feed" },
                        { label: "Marketplace", to: "/marketplace" },
                    ]}
                />
                <main className="mx-auto w-full max-w-2xl flex-1 p-8">
                    <p className="text-muted-foreground">{t("accountSettings.signInRequired")}</p>
                    <Link to="/login" className="mt-4 inline-block font-semibold text-primary">
                        {t("accountSettings.goToLogin")}
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
            />
            <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
                <Link
                    to="/profile"
                    className="mb-6 inline-flex text-sm font-medium text-primary hover:underline"
                >
                    {t("accountSettings.backToProfile")}
                </Link>
                <h1 className="mb-6 text-2xl font-bold">{t("accountSettings.title")}</h1>
                <AccountSettingsPanel tab={tab} onTabChange={setTab} idPrefix="acc-page-" />
            </main>
        </div>
    );
}
