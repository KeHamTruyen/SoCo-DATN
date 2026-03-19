import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success dark:bg-success/20 dark:text-success",
    warning: "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning",
    danger: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
};

export function Badge({
    variant = "default",
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                variantClasses[variant],
                className,
            )}
            {...props}
        />
    );
}
