import { useState, useCallback } from "react";
import { aiApi } from "../api/aiApi";
import type { StudioMode } from "../utils/aiCreativeLabUtils";

interface UseAiStudioGeneratorProps {
    mode: StudioMode;
    prompt: string;
    effectiveTone: string;
    withHashtags: boolean;
    withCta: boolean;
    length: string;
    canLinkProduct: boolean;
    selectedProduct: { title: string; description?: string; price?: number | null; imageUrl?: string | null } | null;
    productQuery: string;
}

export function useAiStudioGenerator({
    mode, prompt, effectiveTone, withHashtags, withCta, length, canLinkProduct, selectedProduct, productQuery
}: UseAiStudioGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generated, setGenerated] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [outputRevision, setOutputRevision] = useState(0);
    const [editorResetNonce, setEditorResetNonce] = useState(0);

    const handleGenerate = useCallback(async () => {
        if (isGenerating) return;
        setErrorMessage(null);

        const idea = prompt.trim();
        const productAttachment =
            canLinkProduct && selectedProduct
                ? [
                      `Linked product: ${selectedProduct.title}`,
                      selectedProduct.description ? `Description: ${selectedProduct.description}` : null,
                      selectedProduct.price != null ? `Price: ${selectedProduct.price}` : null,
                      selectedProduct.imageUrl ? `Image: ${selectedProduct.imageUrl}` : null,
                  ]
                      .filter(Boolean)
                      .join(". ")
                : canLinkProduct && productQuery.trim()
                  ? `Linked product: ${productQuery.trim()}`
                  : "";
        const description = [idea, productAttachment].filter(Boolean).join(". ");

        if (!effectiveTone) {
            setErrorMessage("Vui lòng nhập tone tùy chỉnh, hoặc chọn tone gợi ý.");
            return;
        }

        if (!description) {
            setErrorMessage("Vui lòng nhập mô tả sản phẩm/ý tưởng trước khi tạo nội dung.");
            return;
        }

        setGenerated(null);
        setEditorResetNonce((n) => n + 1);
        setIsGenerating(true);

        try {
            let res;
            if (mode === "text") {
                res = await aiApi.generateText({ description, tone: effectiveTone, withHashtags, withCta, length: length as any });
            } else if (mode === "image") {
                res = await aiApi.generateImageText({ description, tone: effectiveTone, withHashtags, withCta, length: length as any });
            } else {
                res = await aiApi.generateVideoImagesText({ description, tone: effectiveTone, withHashtags, withCta, length: length as any });
            }
            setGenerated(res);
            setOutputRevision((v) => v + 1);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Tạo nội dung thất bại.");
        } finally {
            setIsGenerating(false);
        }
    }, [isGenerating, mode, prompt, effectiveTone, withHashtags, withCta, length, canLinkProduct, selectedProduct, productQuery]);

    const resetGenerator = useCallback(() => {
        setGenerated(null);
        setErrorMessage(null);
        setIsGenerating(false);
        setOutputRevision(0);
        setEditorResetNonce((n) => n + 1);
    }, []);

    return {
        isGenerating,
        generated,
        errorMessage, setErrorMessage,
        outputRevision,
        editorResetNonce, setEditorResetNonce,
        handleGenerate,
        resetGenerator
    };
}
