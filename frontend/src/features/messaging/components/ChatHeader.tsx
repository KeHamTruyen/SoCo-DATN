import { MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Conversation } from "../types/messaging.types";
import { DEFAULT_USER_AVATAR_URL } from "../../../shared/config/defaultAssets";
import { cn } from "../../../shared/lib/cn";

interface ChatHeaderProps {
    conversation: Conversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className="h-10 w-10 shrink-0 rounded-full bg-muted bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${conversation.participantAvatarUrl ?? DEFAULT_USER_AVATAR_URL})`,
                    }}
                />
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-foreground">
                        {conversation.participantName}
                    </h2>
                    <p
                        className={cn(
                            "text-[10px] font-medium",
                            conversation.isOnline ? "text-green-600 dark:text-green-400" : "text-muted-foreground",
                        )}
                    >
                        {conversation.isOnline ? t("messaging.online") : t("messaging.offline")}
                    </p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Link
                    to={`/profile/${conversation.participantId}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/60"
                >
                    {t("messaging.viewProfile")}
                </Link>
                <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60"
                    aria-label={t("messaging.more")}
                >
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
