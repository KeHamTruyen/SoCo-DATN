import { Calendar, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { cn } from "../../../../shared/lib/cn";
import { Button } from "../../../../shared/ui";
import { AiLabRichOutput } from "../../components/AiLabRichOutput";
import { useAiStudio } from "../../context/AiStudioContext";

export function AiStudioOutputPanel() {
    const { 
        form, generator, publisher, 
        onEditorPlainTextChange, onEditorHtmlChange 
    } = useAiStudio();

    const generatedImage = generator.generated?.generatedImage ?? null;
    const textWeightedScore =
        generator.generated?.evaluationScores?.weightedScore ??
        generator.generated?.textScores?.weightedScore;
    const imageWeightedScore = generator.generated?.imageScores?.weightedScore;

    return (
        <section className="relative flex w-full flex-1 flex-col gap-6 overflow-hidden bg-white p-6 dark:bg-neutral-950 lg:w-3/5 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 lg:text-2xl">
                    Soạn và chỉnh sửa bài đăng
                </h3>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 font-semibold"
                        onClick={generator.handleGenerate}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Tạo lại
                    </Button>
                </div>
            </div>

            <div className="relative z-10 flex min-h-70 flex-1 flex-col rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 lg:p-8">
                <div className="flex min-h-0 flex-1 flex-col gap-4">
                    <AiLabRichOutput
                        generated={generator.generated}
                        outputRevision={generator.outputRevision}
                        editorResetNonce={generator.editorResetNonce}
                        withHashtags={form.withHashtags}
                        withCta={form.withCta}
                        length={form.length}
                        onPlainTextChange={onEditorPlainTextChange}
                        onHtmlChange={onEditorHtmlChange}
                    />

                    {form.mode === "image" && generatedImage?.data && (
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                Ảnh AI
                            </p>
                            <img
                                alt="AI generated image"
                                className="max-h-80 w-auto rounded-xl border border-neutral-200 object-contain dark:border-neutral-800"
                                src={`data:${generatedImage.mimeType || "image/jpeg"};base64,${generatedImage.data}`}
                            />
                        </div>
                    )}

                    {generator.generated && form.mode === "video" && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {generator.generated?.videoStatus === "unavailable"
                                ? generator.generated?.message ?? "Video generation hiện chưa khả dụng."
                                : "Đã có kết quả video."}
                        </p>
                    )}

                    {generator.generated && (
                        <div className="border-t border-neutral-200 pt-3 dark:border-neutral-700">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Mode: {form.mode} · Tone: {form.displayTone} · Length: {form.length} · Status:{" "}
                                {generator.generated?.status ?? "—"}
                            </p>
                            {typeof textWeightedScore === "number" && (
                                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                    Text score: {textWeightedScore.toFixed(1)}
                                </p>
                            )}
                            {form.mode === "image" && typeof imageWeightedScore === "number" && (
                                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                    Image score: {imageWeightedScore.toFixed(1)}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {generator.errorMessage && (
                    <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                        {generator.errorMessage}
                    </p>
                )}
            </div>

            <div className="relative z-10 flex flex-col items-stretch justify-end gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center dark:border-neutral-800">
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        "h-12 gap-2 px-5 font-bold",
                        !publisher.hasPostableContent && "pointer-events-none opacity-50",
                    )}
                    disabled={!publisher.hasPostableContent || publisher.postActionBusy}
                    onClick={() => publisher.setScheduleModalOpen(true)}
                >
                    <Calendar className="h-5 w-5" />
                    Lên lịch đăng
                </Button>
                <Button
                    type="button"
                    className="h-12 gap-2 px-6 font-bold shadow-lg shadow-primary/20"
                    disabled={!publisher.hasPostableContent || publisher.postActionBusy}
                    onClick={() => void publisher.handlePublishNow()}
                >
                    {publisher.postActionBusy ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <CheckCircle className="h-5 w-5" />
                    )}
                    Đăng ngay
                </Button>
            </div>
        </section>
    );
}
