import { CalendarClock, ChevronRight, Wand2 } from "lucide-react";
import { CREATE_POST_FEATURE_CARD_CLASS, CREATE_POST_FEATURE_ICON_CLASS } from "./createPostModalConstants";

interface CreatePostFeatureCardsProps {
    hideScheduleOption: boolean;
    isScheduleMode: boolean;
    aiTitle: string;
    aiDescription: string;
    scheduleTitle: string;
    scheduleDescription: string;
    onOpenAiLab: () => void;
    onToggleSchedule: () => void;
}

export function CreatePostFeatureCards({
    hideScheduleOption,
    isScheduleMode,
    aiTitle,
    aiDescription,
    scheduleTitle,
    scheduleDescription,
    onOpenAiLab,
    onToggleSchedule,
}: CreatePostFeatureCardsProps) {
    return (
        <div
            className={`grid gap-3 px-4 pb-2 sm:px-6 ${hideScheduleOption ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}
        >
            <button type="button" onClick={onOpenAiLab} className={CREATE_POST_FEATURE_CARD_CLASS}>
                <div className="flex items-start justify-between gap-2">
                    <div className={CREATE_POST_FEATURE_ICON_CLASS}>
                        <Wand2 className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-primary opacity-70 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div>
                    <p className="font-semibold text-foreground">{aiTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{aiDescription}</p>
                </div>
            </button>

            {!hideScheduleOption ? (
                <button
                    type="button"
                    onClick={onToggleSchedule}
                    className={`${CREATE_POST_FEATURE_CARD_CLASS} ${isScheduleMode ? "ring-2 ring-primary/40" : ""}`}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className={CREATE_POST_FEATURE_ICON_CLASS}>
                            <CalendarClock className="h-5 w-5" />
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-primary opacity-70 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">{scheduleTitle}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{scheduleDescription}</p>
                    </div>
                </button>
            ) : null}
        </div>
    );
}
