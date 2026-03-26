import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Monitor, Moon, Sun, X } from "lucide-react";
import { Button } from "../../atoms/button";
import { cn } from "../../../lib/cn";
import { useThemePreference, type ThemePreference } from "../../../theme/ThemePreferenceProvider";
import { useTranslation } from "react-i18next";

interface ThemePickerModalProps {
    onClose: () => void;
}

const OPTIONS: {
    value: ThemePreference;
    labelKey: string;
    descriptionKey: string;
    icon: ReactNode;
}[] = [
    {
        value: "light",
        labelKey: "theme.light",
        descriptionKey: "theme.lightDesc",
        icon: <Sun className="h-5 w-5" />,
    },
    {
        value: "dark",
        labelKey: "theme.dark",
        descriptionKey: "theme.darkDesc",
        icon: <Moon className="h-5 w-5" />,
    },
    {
        value: "system",
        labelKey: "theme.system",
        descriptionKey: "theme.systemDesc",
        icon: <Monitor className="h-5 w-5" />,
    },
];

export function ThemePickerModal({ onClose }: ThemePickerModalProps) {
    const { preference, setPreference } = useThemePreference();
    const { t } = useTranslation();

    const handleSelect = (p: ThemePreference) => {
        setPreference(p);
        onClose();
    };

    const modal = (
        <div
            role="presentation"
            className="fixed inset-0 z-[9999] bg-neutral-900/45 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="theme-modal-title"
                className="fixed left-1/2 top-[40%] max-h-[85vh] w-[min(calc(100%-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-background-light text-neutral-900 shadow-2xl dark:border-neutral-800 dark:bg-background-dark dark:text-neutral-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                    <h2
                        id="theme-modal-title"
                        className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
                    >
                        {t("theme.title")}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("theme.close")}>
                        <X className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                    </Button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={cn(
                                "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                                preference === opt.value
                                    ? "border-primary bg-primary/10 text-primary dark:text-primary"
                                    : "border-neutral-200 text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800/80",
                            )}
                        >
                            <span
                                className={cn(
                                    "mt-0.5 shrink-0",
                                    preference === opt.value
                                        ? "text-primary"
                                        : "text-neutral-500 dark:text-neutral-300",
                                )}
                            >
                                {opt.icon}
                            </span>
                            <span>
                                <span className="block font-semibold text-inherit">{t(opt.labelKey)}</span>
                                <span
                                    className={cn(
                                        "mt-0.5 block text-xs",
                                        preference === opt.value
                                            ? "text-primary/80 dark:text-primary/85"
                                            : "text-neutral-500 dark:text-neutral-400",
                                    )}
                                >
                                    {t(opt.descriptionKey)}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
