import type { ImgHTMLAttributes } from "react";
import { DEFAULT_USER_AVATAR_URL } from "../../config/defaultAssets";
import { cn } from "../../lib/cn";

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
    wrapperClassName?: string;
}

export function Avatar({ wrapperClassName, className, alt, src, ...props }: AvatarProps) {
    const resolvedSrc =
        src != null && String(src).trim() !== "" ? String(src) : DEFAULT_USER_AVATAR_URL;
    return (
        <div
            className={cn(
                "size-9 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700",
                wrapperClassName,
            )}
        >
            <img
                src={resolvedSrc}
                alt={alt ?? "Avatar"}
                className={cn("h-full w-full object-cover", className)}
                {...props}
            />
        </div>
    );
}
