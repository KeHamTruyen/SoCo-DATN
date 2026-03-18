import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
                className,
            )}
            {...props}
        />
    );
}
