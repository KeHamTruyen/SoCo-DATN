import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "bg-primary text-primary-foreground hover:bg-primary-700 shadow-lg shadow-primary/20",
    outline:
        "border border-border bg-background text-foreground hover:bg-muted",
    ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
    destructive:
        "bg-destructive text-destructive-foreground hover:bg-red-700 shadow-lg shadow-destructive/20",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-base",
    icon: "h-10 w-10 p-0",
};

export function Button({
    variant = "primary",
    size = "md",
    className,
    type = "button",
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        />
    );
}
