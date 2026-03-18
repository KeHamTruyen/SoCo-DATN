import { cn } from "../../lib/cn";

interface SeparatorProps {
    className?: string;
}

export function Separator({ className }: SeparatorProps) {
    return (
        <div
            className={cn("h-px w-full bg-slate-200 dark:bg-slate-800", className)}
        />
    );
}
