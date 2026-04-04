import type { CSSProperties } from "react";
import type { RefObject } from "react";
import { DayPicker } from "react-day-picker";
import { startOfDay } from "date-fns";

interface CreatePostScheduleSectionProps {
    schedulePanelRef: RefObject<HTMLDivElement | null>;
    rdpThemeStyle: CSSProperties;
    scheduleDate: Date | undefined;
    onSelectDate: (d: Date | undefined) => void;
    scheduleTime: string;
    onScheduleTimeChange: (v: string) => void;
    timeLabel: string;
    scheduleHeading: string;
    postNowLabel: string;
    onPostNowInstead: () => void;
}

export function CreatePostScheduleSection({
    schedulePanelRef,
    rdpThemeStyle,
    scheduleDate,
    onSelectDate,
    scheduleTime,
    onScheduleTimeChange,
    timeLabel,
    scheduleHeading,
    postNowLabel,
    onPostNowInstead,
}: CreatePostScheduleSectionProps) {
    return (
        <div ref={schedulePanelRef} className="space-y-3 px-4 py-3 sm:px-6">
            <label className="block text-center text-sm font-semibold text-foreground">
                {scheduleHeading}
            </label>
            <div className="flex w-full justify-center">
                <div className="inline-flex max-w-full rounded-xl border border-border bg-card p-3 text-card-foreground">
                    <DayPicker
                        mode="single"
                        required={false}
                        selected={scheduleDate}
                        onSelect={onSelectDate}
                        disabled={{ before: startOfDay(new Date()) }}
                        style={rdpThemeStyle}
                        className="mx-auto text-foreground [--rdp-weekday-opacity:1] [&_.rdp-weekday]:text-muted-foreground [&_.rdp-outside]:opacity-60 [&_.rdp-outside]:text-muted-foreground [&_.rdp-month_caption]:text-foreground [&_.rdp-caption_label]:text-foreground"
                    />
                </div>
            </div>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                <label
                    htmlFor="create-post-schedule-time"
                    className="shrink-0 text-sm font-medium text-foreground"
                >
                    {timeLabel}
                </label>
                <input
                    id="create-post-schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => onScheduleTimeChange(e.target.value)}
                    className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-48"
                />
            </div>
            <div className="flex justify-center">
                <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={onPostNowInstead}
                >
                    {postNowLabel}
                </button>
            </div>
        </div>
    );
}
