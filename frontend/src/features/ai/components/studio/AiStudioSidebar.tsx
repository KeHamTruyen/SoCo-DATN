import { Sparkles, BarChart3, Megaphone, FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../../shared/lib/cn";

export function AiStudioSidebar() {
    const { t } = useTranslation();
    return (
        <aside
            className={cn(
                "flex shrink-0 flex-col border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900",
                "w-full border-b lg:w-64 lg:border-b-0 lg:border-r",
            )}
        >
            <div className="flex items-center gap-3 px-4 py-5 lg:px-4 lg:py-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-lg font-bold leading-tight text-neutral-900 dark:text-neutral-50">
                        {t("aiCreativeLab.sidebar.title")}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t("aiCreativeLab.sidebar.subtitle")}
                    </p>
                </div>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-2 pb-4 lg:px-3">
                <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg bg-white px-3 py-3 text-sm font-semibold text-primary shadow-sm dark:bg-neutral-950"
                >
                    <Sparkles className="h-5 w-5" />
                    {t("aiCreativeLab.sidebar.navStudio")}
                </button>
                <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                    <BarChart3 className="h-5 w-5" />
                    {t("aiCreativeLab.sidebar.navAnalytics")}
                </button>
                <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                    <Megaphone className="h-5 w-5" />
                    {t("aiCreativeLab.sidebar.navCampaigns")}
                </button>
                <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                    <FolderOpen className="h-5 w-5" />
                    {t("aiCreativeLab.sidebar.navLibrary")}
                </button>
            </nav>
        </aside>
    );
}
