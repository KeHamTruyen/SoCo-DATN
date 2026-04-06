import { CalendarClock, CheckCircle, Loader2, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { startOfDay } from "date-fns";
import type { CSSProperties } from "react";
import { Button } from "../../../../shared/ui";
import { useAiStudio } from "../../context/AiStudioContext";

const rdpThemeStyle = {
    "--rdp-accent-color": "var(--primary)",
    "--rdp-accent-background-color": "var(--primary-subtle)",
    "--rdp-day_button-border-radius": "var(--radius)",
    "--rdp-today-color": "var(--primary)",
    "--rdp-nav_button-height": "2.25rem",
    "--rdp-nav_button-width": "2.25rem",
} as CSSProperties;

export function AiStudioScheduleModal() {
    const { publisher } = useAiStudio();

    if (publisher.successModal !== "none") {
        return (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-background-light p-6 text-center shadow-2xl dark:border-neutral-800 dark:bg-background-dark">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <p className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                        {publisher.successModal === "scheduled"
                            ? "Đã lên lịch đăng thành công."
                            : "Đã đăng bài thành công."}
                    </p>
                    <Button
                        type="button"
                        className="w-full font-semibold"
                        onClick={() => publisher.setSuccessModal("none")}
                    >
                        Đóng
                    </Button>
                </div>
            </div>
        );
    }

    if (!publisher.scheduleModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <div
                role="presentation"
                className="absolute inset-0"
                onClick={() => !publisher.postActionBusy && publisher.setScheduleModalOpen(false)}
                aria-hidden
            />
            <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-neutral-200 bg-background-light shadow-2xl dark:border-neutral-800 dark:bg-background-dark sm:rounded-xl">
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        disabled={publisher.postActionBusy}
                        onClick={() => publisher.setScheduleModalOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">Lên lịch đăng</h2>
                    <Button
                        type="button"
                        size="sm"
                        className="rounded-full px-5"
                        disabled={publisher.postActionBusy || !publisher.scheduledAt}
                        onClick={() => void publisher.handleConfirmSchedule()}
                    >
                        {publisher.postActionBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Xác nhận"
                        )}
                    </Button>
                </div>
                <div className="space-y-3 overflow-y-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
                        Chọn ngày và giờ đăng bài (giống khi tạo bài trên Feed).
                    </div>
                    <label className="block text-center text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                        Ngày &amp; giờ
                    </label>
                    <div className="flex w-full justify-center">
                        <div className="inline-flex max-w-full rounded-xl border border-neutral-200 bg-card p-3 text-card-foreground dark:border-neutral-700">
                            <DayPicker
                                mode="single"
                                required={false}
                                selected={publisher.scheduleDate}
                                onSelect={publisher.setScheduleDate}
                                disabled={{ before: startOfDay(new Date()) }}
                                style={rdpThemeStyle}
                                className="mx-auto text-foreground [--rdp-weekday-opacity:1] [&_.rdp-weekday]:text-muted-foreground [&_.rdp-outside]:opacity-60 [&_.rdp-outside]:text-muted-foreground [&_.rdp-month_caption]:text-foreground [&_.rdp-caption_label]:text-foreground"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                        <label
                            htmlFor="ai-lab-schedule-time"
                            className="shrink-0 text-sm font-medium text-neutral-900 dark:text-neutral-50"
                        >
                            Giờ
                        </label>
                        <input
                            id="ai-lab-schedule-time"
                            type="time"
                            value={publisher.scheduleTime}
                            onChange={(e) => publisher.setScheduleTime(e.target.value)}
                            className="h-10 w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 sm:max-w-48"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
