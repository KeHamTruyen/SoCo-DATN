import { Globe, Lock, UserPlus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../shared/lib/cn";
import type { PostVisibility } from "../types/feed.types";

const ICONS: Record<PostVisibility, typeof Globe> = {
    PUBLIC: Globe,
    FOLLOWERS: Users,
    FOLLOWING: UserPlus,
    PRIVATE: Lock,
};

function coerceVisibility(v: unknown): PostVisibility {
    if (v === "PUBLIC" || v === "FOLLOWERS" || v === "FOLLOWING" || v === "PRIVATE") return v;
    return "PUBLIC";
}

interface PostVisibilityInlineProps {
    visibility?: PostVisibility | null;
    className?: string;
}

export function PostVisibilityInline({ visibility, className }: PostVisibilityInlineProps) {
    const { t } = useTranslation();
    const v = coerceVisibility(visibility);
    const Icon = ICONS[v];
    const label = t(`feed.visibility.${v}`);

    return (
        <span
            className={cn("inline-flex max-w-full items-center gap-0.5 text-neutral-500 dark:text-neutral-400", className)}
            title={label}
        >
            <Icon className="h-3 w-3 shrink-0 opacity-85" aria-hidden />
            <span className="min-w-0 truncate text-[11px] font-medium">{label}</span>
        </span>
    );
}
