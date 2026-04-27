import { ChevronDown, MessageCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Conversation } from "../types/messaging.types";
import { DEFAULT_USER_AVATAR_URL } from "../../../shared/config/defaultAssets";

interface DockAvatarStripProps {
    conversations: Conversation[];
    dockAvatarIds: string[];
    dockOpenIds: string[];
    dockExpanded: boolean;
    onTogglePanel: (conversationId: string) => void;
    aiOpen: boolean;
    onToggleAi: () => void;
    onToggleExpanded: () => void;
}

/**
 * The right-edge column of avatar bubbles + the FAB toggle button.
 * Extracted from MessageDock for clarity.
 */
export function DockAvatarStrip({
    conversations,
    dockAvatarIds,
    dockOpenIds,
    dockExpanded,
    onTogglePanel,
    aiOpen,
    onToggleAi,
    onToggleExpanded,
}: DockAvatarStripProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center gap-2">
            {dockExpanded && dockAvatarIds.length > 0 && (
                <div className="flex flex-col gap-2">
                    {dockAvatarIds.map((id) => {
                        const c = conversations.find((conv) => conv.id === id);
                        if (!c) return null;
                        const panelOpen = dockOpenIds.includes(id);
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => onTogglePanel(id)}
                                className={`relative h-10 w-10 shrink-0 rounded-full border-2 bg-cover bg-center shadow-md transition hover:ring-2 hover:ring-primary ${
                                    panelOpen
                                        ? "border-primary ring-2 ring-primary/40"
                                        : "border-border ring-2 ring-transparent"
                                }`}
                                style={{
                                    backgroundImage: `url(${c.participantAvatarUrl ?? DEFAULT_USER_AVATAR_URL})`,
                                }}
                                title={
                                    c.unreadCount > 0
                                        ? `${c.participantName} — ${t("messaging.dockAvatarUnreadAria", { count: c.unreadCount })}`
                                        : c.participantName
                                }
                                aria-pressed={panelOpen}
                            >
                                {c.unreadCount > 0 ? (
                                    <span
                                        className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground"
                                        aria-hidden
                                    >
                                        {c.unreadCount > 99
                                            ? "99+"
                                            : c.unreadCount}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            )}

            {dockExpanded && (
                <button
                    type="button"
                    onClick={onToggleAi}
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-md transition hover:ring-2 hover:ring-primary ${
                        aiOpen
                            ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/40"
                            : "border-border bg-card text-primary"
                    }`}
                    title="AI Shopping Assistant"
                    aria-pressed={aiOpen}
                >
                    <Sparkles className="h-4 w-4" />
                </button>
            )}

            <button
                type="button"
                onClick={onToggleExpanded}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition hover:bg-muted/60"
                aria-expanded={dockExpanded}
                aria-label={
                    dockExpanded
                        ? t("messaging.dockCollapse")
                        : t("messaging.dockExpand")
                }
            >
                {dockExpanded ? (
                    <ChevronDown className="h-6 w-6" />
                ) : (
                    <MessageCircle className="h-6 w-6" />
                )}
            </button>
        </div>
    );
}
