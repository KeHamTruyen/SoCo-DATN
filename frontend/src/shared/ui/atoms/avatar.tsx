import type { ImgHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
    wrapperClassName?: string;
}

export function Avatar({ wrapperClassName, className, alt, ...props }: AvatarProps) {
    return (
        <div
            className={cn(
                "size-9 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700",
                wrapperClassName,
            )}
        >
            <img
                alt={alt ?? "Avatar"}
                className={cn("h-full w-full object-cover", className)}
                {...props}
            />
        </div>
    );
}
