import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Input({
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={cn(
                "h-11 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20",
                className,
            )}
            {...props}
        />
    );
}
