import type { InputHTMLAttributes, ReactNode } from "react";
import { Input, Label } from "../../atoms";
import { cn } from "../../../lib/cn";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    errorText?: string;
    leftIcon?: ReactNode;
    rightSlot?: ReactNode;
    containerClassName?: string;
}

export function FormField({
    label,
    helperText,
    errorText,
    leftIcon,
    rightSlot,
    id,
    className,
    containerClassName,
    ...props
}: FormFieldProps) {
    return (
        <div className={cn("space-y-2", containerClassName)}>
            {label ? <Label htmlFor={id}>{label}</Label> : null}
            <div className="relative">
                {leftIcon ? (
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                        {leftIcon}
                    </span>
                ) : null}
                <Input className={cn(leftIcon ? "pl-10" : "", rightSlot ? "pr-11" : "", className)} id={id} {...props} />
                {rightSlot ? (
                    <span className="absolute inset-y-0 right-3 flex items-center">
                        {rightSlot}
                    </span>
                ) : null}
            </div>
            {errorText ? (
                <p className="text-xs text-red-600 dark:text-red-400">{errorText}</p>
            ) : helperText ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
            ) : null}
        </div>
    );
}
