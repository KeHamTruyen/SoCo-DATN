import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../atoms";

interface GuestAuthModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export function GuestAuthModal({
    open,
    onClose,
    title,
    description,
}: GuestAuthModalProps) {
    const { t } = useTranslation();
    if (!open) return null;
    const resolvedTitle = title ?? t("guestAuth.title");
    const resolvedDescription = description ?? t("guestAuth.description");

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            role="presentation"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
                role="dialog"
                aria-modal="true"
                aria-label={resolvedTitle}
                onClick={(event) => event.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{resolvedTitle}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                    {resolvedDescription}
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        {t("accountSettings.closeModal")}
                    </Button>
                    <Link to="/login" onClick={onClose}>
                        <Button>{t("header.login")}</Button>
                    </Link>
                    <Link to="/signup" onClick={onClose}>
                        <Button variant="outline">{t("header.register")}</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
