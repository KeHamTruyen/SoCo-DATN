import { cn } from "../../lib/cn";

interface SeparatorProps {
    className?: string;
}

export function Separator({ className }: SeparatorProps) {
    return (
        <div
            className={cn("h-px w-full bg-neutral-200 dark:bg-neutral-800", className)}
        />
    );
}
