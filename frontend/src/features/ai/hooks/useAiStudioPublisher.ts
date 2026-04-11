import { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { feedApi } from "../../feed/api/feedApi";
import { uploadApi } from "../../upload/api/uploadApi";
import {
    isPostBodyHtmlEmpty,
    plainOrLegacyToPostHtml,
    sanitizePostHtml,
} from "../../../shared/tiptap/postHtmlUtils";
import {
    aiLabToDatetimeLocalValue,
    base64ToFile,
    buildPlainTextFromGenerated,
    type StudioMode,
} from "../utils/aiCreativeLabUtils";
import type { CreatePostPayload, PostMediaType } from "../../feed/types/feed.types";
import { aiApi } from "../api/aiApi";

interface UseAiStudioPublisherProps {
    mode: StudioMode;
    generated: any;
    hasDraftText: boolean;
    outputHtmlRef: React.MutableRefObject<string>;
    outputPlainTextRef: React.MutableRefObject<string>;
    length: string;
    withHashtags: boolean;
    withCta: boolean;
    canLinkProduct: boolean;
    selectedProduct: { id: string } | null;
    resetPageState: () => void;
    /** Latest AI history row to mark completed in Library after publish/schedule. */
    lastHistoryIdRef: React.MutableRefObject<string | null>;
}

export function useAiStudioPublisher({
    mode, generated, hasDraftText, outputHtmlRef, outputPlainTextRef,
    length, withHashtags, withCta, canLinkProduct, selectedProduct, resetPageState,
    lastHistoryIdRef,
}: UseAiStudioPublisherProps) {
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [successModal, setSuccessModal] = useState<"none" | "scheduled" | "published">("none");
    const [scheduleDate, setScheduleDate] = useState<Date | undefined>(() => new Date());
    const [scheduleTime, setScheduleTime] = useState(() => format(new Date(), "HH:mm"));
    const [postActionBusy, setPostActionBusy] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const scheduledAt = useMemo(
        () => aiLabToDatetimeLocalValue(scheduleDate, scheduleTime),
        [scheduleDate, scheduleTime],
    );

    const hasPostableContent = useMemo(() => {
        const textOk = hasDraftText;
        const imageOk = mode === "image" && Boolean(generated?.generatedImage?.data);
        return Boolean(textOk || imageOk);
    }, [generated, mode, hasDraftText]);

    const buildCreatePayload = useCallback(async (): Promise<CreatePostPayload> => {
        const fallbackPlain = generated
            ? buildPlainTextFromGenerated(generated, length as any, withHashtags, withCta)
            : "";

        let content = "";
        const htmlRaw = outputHtmlRef.current;
        if (htmlRaw && !isPostBodyHtmlEmpty(htmlRaw)) {
            content = sanitizePostHtml(htmlRaw);
        } else {
            const plain = (outputPlainTextRef.current.trim() || fallbackPlain).trim();
            if (plain) {
                content = sanitizePostHtml(plainOrLegacyToPostHtml(plain));
            }
        }

        let mediaUrls: string[] | undefined;
        let mediaType: PostMediaType | undefined;
        if (mode === "image" && generated?.generatedImage?.data) {
            const mime = generated.generatedImage.mimeType || "image/jpeg";
            const ext = mime.includes("png") ? "png" : "jpg";
            const file = base64ToFile(
                String(generated.generatedImage.data),
                mime,
                `ai-generated.${ext}`,
            );
            const { url } = await uploadApi.uploadPostMedia(file);
            mediaUrls = [url];
            mediaType = "IMAGE";
        }

        return {
            content,
            mediaUrls,
            mediaType,
            productId: canLinkProduct ? selectedProduct?.id ?? undefined : undefined,
        };
    }, [
        canLinkProduct,
        generated,
        length,
        mode,
        selectedProduct,
        withCta,
        withHashtags,
        outputHtmlRef,
        outputPlainTextRef
    ]);

    const handlePublishNow = useCallback(async () => {
        if (!hasPostableContent || postActionBusy) return;
        setErrorMessage(null);
        setPostActionBusy(true);
        try {
            const payload = await buildCreatePayload();
            if (!payload.content?.trim() && !payload.mediaUrls?.length) {
                setErrorMessage("Không có nội dung để đăng.");
                return;
            }
            const created = await feedApi.createPost(payload);
            const postId = created?.id?.trim();
            if (postId && lastHistoryIdRef.current) {
                try {
                    await aiApi.patchHistoryLinkPost(
                        lastHistoryIdRef.current,
                        postId,
                        "post",
                    );
                } catch {
                    /* Library link is best-effort */
                }
                lastHistoryIdRef.current = null;
            }
            resetPageState();
            setSuccessModal("published");
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Đăng bài thất bại.");
        } finally {
            setPostActionBusy(false);
        }
    }, [
        buildCreatePayload,
        hasPostableContent,
        postActionBusy,
        resetPageState,
        lastHistoryIdRef,
    ]);

    const handleConfirmSchedule = useCallback(async () => {
        if (!hasPostableContent || postActionBusy) return;
        if (!scheduledAt) {
            setErrorMessage("Chọn ngày và giờ đăng.");
            return;
        }
        const when = new Date(scheduledAt);
        if (when.getTime() <= Date.now()) {
            setErrorMessage("Thời điểm đăng phải ở tương lai.");
            return;
        }
        setErrorMessage(null);
        setPostActionBusy(true);
        try {
            const base = await buildCreatePayload();
            if (!base.content?.trim() && !base.mediaUrls?.length) {
                setErrorMessage("Không có nội dung để lên lịch.");
                return;
            }
            const post = await feedApi.createScheduledPost({
                ...base,
                scheduledAt,
            });
            const postId = post?.id;
            if (postId && lastHistoryIdRef.current) {
                try {
                    await aiApi.patchHistoryLinkPost(
                        lastHistoryIdRef.current,
                        postId,
                        "scheduled_post",
                    );
                } catch {
                    /* Library link is best-effort */
                }
                lastHistoryIdRef.current = null;
            }
            resetPageState();
            setSuccessModal("scheduled");
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Lên lịch đăng thất bại.");
        } finally {
            setPostActionBusy(false);
        }
    }, [
        buildCreatePayload,
        hasPostableContent,
        postActionBusy,
        resetPageState,
        scheduledAt,
        lastHistoryIdRef,
    ]);

    const resetPublisher = useCallback(() => {
        setScheduleModalOpen(false);
        setSuccessModal("none");
        setScheduleDate(new Date());
        setScheduleTime(format(new Date(), "HH:mm"));
        setPostActionBusy(false);
        setErrorMessage(null);
    }, []);

    return {
        scheduleModalOpen, setScheduleModalOpen,
        successModal, setSuccessModal,
        scheduleDate, setScheduleDate,
        scheduleTime, setScheduleTime,
        postActionBusy,
        errorMessage, setErrorMessage,
        scheduledAt,
        hasPostableContent,
        handlePublishNow,
        handleConfirmSchedule,
        resetPublisher
    };
}
