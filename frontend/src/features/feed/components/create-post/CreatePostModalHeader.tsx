import { X } from "lucide-react";
import { Button } from "../../../../shared/ui/atoms/button";

interface CreatePostModalHeaderProps {
    title: string;
    submitLabel: string;
    canSubmit: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

export function CreatePostModalHeader({
    title,
    submitLabel,
    canSubmit,
    onClose,
    onSubmit,
}: CreatePostModalHeaderProps) {
    return (
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-6 sm:py-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button
                size="sm"
                className="rounded-full px-5"
                onClick={() => void onSubmit()}
                disabled={!canSubmit}
            >
                {submitLabel}
            </Button>
        </div>
    );
}
