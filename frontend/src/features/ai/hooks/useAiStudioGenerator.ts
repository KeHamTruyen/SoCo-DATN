import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { StudioMode } from "../utils/aiCreativeLabUtils";
import type { GeneratedText, GenerateTextResult } from "../api/aiApi";
import { useAiTextGeneration } from "./useAiTextGeneration";
import { useAiImageGeneration } from "./useAiImageGeneration";

interface UseAiStudioGeneratorProps {
    mode: StudioMode;
    prompt: string;
    effectiveTone: string;
    withHashtags: boolean;
    withCta: boolean;
    length: string;
    canLinkProduct: boolean;
    selectedProduct: {
        id: string;
        title: string;
        description?: string;
        price?: number | null;
        imageUrl?: string | null;
    } | null;
    productQuery: string;
    /** Latest AI history row id for linking after publish (Creative Lab Library). */
    onHistoryId?: (id: string | null) => void;
}

export function useAiStudioGenerator({
    mode,
    prompt,
    effectiveTone,
    withHashtags,
    withCta,
    length,
    canLinkProduct,
    selectedProduct,
    productQuery,
    onHistoryId,
}: UseAiStudioGeneratorProps) {
    const { t } = useTranslation();
    const {
        generateText,
        isGenerating: textBusy,
        reset: resetText,
    } = useAiTextGeneration();
    const {
        generateImageText,
        generateVideoImagesText,
        isGenerating: imageBusy,
        reset: resetImage,
    } = useAiImageGeneration();

    const [generated, setGenerated] = useState<unknown>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [outputRevision, setOutputRevision] = useState(0);
    const [editorResetNonce, setEditorResetNonce] = useState(0);

    const isGenerating = textBusy || imageBusy;

    const handleGenerate = useCallback(async () => {
        if (textBusy || imageBusy) return;
        setErrorMessage(null);

        const idea = prompt.trim();
        const productAttachment =
            canLinkProduct && selectedProduct
                ? [
                      `Linked product: ${selectedProduct.title}`,
                      selectedProduct.description
                          ? `Description: ${selectedProduct.description}`
                          : null,
                      selectedProduct.price != null
                          ? `Price: ${selectedProduct.price}`
                          : null,
                      selectedProduct.imageUrl
                          ? `Image: ${selectedProduct.imageUrl}`
                          : null,
                  ]
                      .filter(Boolean)
                      .join(". ")
                : canLinkProduct && productQuery.trim()
                  ? `Linked product: ${productQuery.trim()}`
                  : "";
        const description = [idea, productAttachment].filter(Boolean).join(". ");

        if (!effectiveTone) {
            setErrorMessage(t("aiCreativeLab.errors.toneRequired"));
            return;
        }

        if (!description) {
            setErrorMessage(t("aiCreativeLab.errors.descriptionRequired"));
            return;
        }

        setGenerated(null);
        setEditorResetNonce((n) => n + 1);

        const historyExtras: {
            sourceIdea?: string;
            linkedProductId?: string;
            productTitle?: string;
            productImageUrl?: string;
        } = {};
        if (idea.trim()) historyExtras.sourceIdea = idea.trim();
        if (canLinkProduct && selectedProduct) {
            historyExtras.linkedProductId = selectedProduct.id;
            historyExtras.productTitle = selectedProduct.title;
            if (selectedProduct.imageUrl?.trim()) {
                historyExtras.productImageUrl = selectedProduct.imageUrl.trim();
            }
        }

        const payload = {
            description,
            tone: effectiveTone,
            withHashtags,
            withCta,
            length: length as "Short" | "Medium" | "Long",
            ...historyExtras,
        };

        try {
            let res: unknown;
            if (mode === "text") {
                res = await generateText(payload);
            } else if (mode === "image") {
                res = await generateImageText(payload);
            } else {
                res = await generateVideoImagesText(payload);
            }
            setGenerated(res);
            setOutputRevision((v) => v + 1);
            const hid = (res as { historyId?: string | null }).historyId;
            onHistoryId?.(
                typeof hid === "string" && hid.length > 0 ? hid : null,
            );
        } catch (err) {
            setErrorMessage(
                err instanceof Error
                    ? err.message
                    : t("aiCreativeLab.errors.generationFailed"),
            );
        }
    }, [
        textBusy,
        imageBusy,
        mode,
        prompt,
        effectiveTone,
        withHashtags,
        withCta,
        length,
        canLinkProduct,
        selectedProduct,
        productQuery,
        generateText,
        generateImageText,
        generateVideoImagesText,
        t,
        onHistoryId,
    ]);

    const resetGenerator = useCallback(() => {
        resetText();
        resetImage();
        setGenerated(null);
        setErrorMessage(null);
        setOutputRevision(0);
        setEditorResetNonce((n) => n + 1);
        onHistoryId?.(null);
    }, [resetText, resetImage, onHistoryId]);

    const applyHistorySnapshot = useCallback(
        (generatedContentJson: string) => {
            let parsed: GeneratedText;
            try {
                parsed = JSON.parse(generatedContentJson) as GeneratedText;
            } catch {
                setErrorMessage(t("aiCreativeLab.library.invalidSnapshot"));
                return;
            }
            resetText();
            resetImage();
            setErrorMessage(null);
            const snapshot: GenerateTextResult = {
                generatedText: parsed,
                status: "approved",
            };
            setGenerated(snapshot);
            setEditorResetNonce((n) => n + 1);
            setOutputRevision((v) => v + 1);
            onHistoryId?.(null);
        },
        [resetText, resetImage, t, onHistoryId],
    );

    return {
        isGenerating,
        generated,
        errorMessage,
        setErrorMessage,
        outputRevision,
        editorResetNonce,
        setEditorResetNonce,
        handleGenerate,
        resetGenerator,
        applyHistorySnapshot,
    };
}
