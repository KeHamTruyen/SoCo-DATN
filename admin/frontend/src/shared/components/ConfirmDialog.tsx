import { useEffect, useState } from "react";

type Props = {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Shown on the confirm button while `onConfirm` is in progress. */
    processingLabel?: string;
    variant?: "default" | "danger";
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
};

function Spinner({ className }: { className?: string }) {
    return (
        <span
            className={`inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className ?? ""}`}
            aria-hidden
        />
    );
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    processingLabel = "Processing…",
    variant = "default",
    onConfirm,
    onClose,
}: Props) {
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (!open) setPending(false);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const h = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !pending) onClose();
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [open, onClose, pending]);

    if (!open) return null;

    const handleBackdropClick = () => {
        if (!pending) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            role="presentation"
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg"
                role="dialog"
                aria-busy={pending}
                aria-live="polite"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                {description ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        disabled={pending}
                        onClick={onClose}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        disabled={pending}
                        onClick={async () => {
                            setPending(true);
                            try {
                                await Promise.resolve(onConfirm());
                                onClose();
                            } catch {
                                /* keep open */
                            } finally {
                                setPending(false);
                            }
                        }}
                        className={
                            variant === "danger"
                                ? "inline-flex min-w-30 items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-80"
                                : "inline-flex min-w-30 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-80"
                        }
                    >
                        {pending ? (
                            <>
                                <Spinner />
                                <span>{processingLabel}</span>
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
