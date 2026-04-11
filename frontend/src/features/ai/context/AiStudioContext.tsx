import React, { createContext, useContext, useCallback, useRef, useState, useMemo } from "react";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { isSellerRole } from "../../../shared/auth/roleGuards";
import { useAiStudioForm } from "../hooks/useAiStudioForm";
import { useAiStudioProducts } from "../hooks/useAiStudioProducts";
import { useAiStudioGenerator } from "../hooks/useAiStudioGenerator";
import { useAiStudioPublisher } from "../hooks/useAiStudioPublisher";

interface AiStudioContextValue {
    form: ReturnType<typeof useAiStudioForm>;
    products: ReturnType<typeof useAiStudioProducts>;
    generator: ReturnType<typeof useAiStudioGenerator>;
    publisher: ReturnType<typeof useAiStudioPublisher>;
    canLinkProduct: boolean;
    hasDraftText: boolean;
    setHasDraftText: React.Dispatch<React.SetStateAction<boolean>>;
    onEditorPlainTextChange: (plain: string) => void;
    onEditorHtmlChange: (html: string) => void;
    resetAll: () => void;
    outputPlainTextRef: React.MutableRefObject<string>;
    outputHtmlRef: React.MutableRefObject<string>;
    /** Restore prompt + generated text from Library (no API call). */
    restoreFromHistoryItem: (item: { prompt: string; generatedContent: string }) => void;
}

const AiStudioContext = createContext<AiStudioContextValue | null>(null);

export function AiStudioProvider({
    children,
    onSwitchToStudioTab,
}: {
    children: React.ReactNode;
    onSwitchToStudioTab?: () => void;
}) {
    const { user } = useAuthSession();
    const canLinkProduct = isSellerRole(user?.role);

    const form = useAiStudioForm();
    const products = useAiStudioProducts(canLinkProduct);
    const lastHistoryIdRef = useRef<string | null>(null);
    const setLastHistoryId = useCallback((id: string | null) => {
        lastHistoryIdRef.current = id;
    }, []);

    const generator = useAiStudioGenerator({
        mode: form.mode,
        prompt: form.prompt,
        effectiveTone: form.effectiveTone,
        withHashtags: form.withHashtags,
        withCta: form.withCta,
        length: form.length,
        canLinkProduct,
        selectedProduct: products.selectedProduct,
        productQuery: products.productQuery,
        onHistoryId: setLastHistoryId,
    });

    const [hasDraftText, setHasDraftText] = useState(false);
    const outputPlainTextRef = useRef("");
    const outputHtmlRef = useRef("<p></p>");

    const resetAll = useCallback(() => {
        form.resetForm();
        products.resetProducts();
        generator.resetGenerator();
        lastHistoryIdRef.current = null;
        setHasDraftText(false);
        outputPlainTextRef.current = "";
        outputHtmlRef.current = "<p></p>";
    }, [form, products, generator]);

    const publisher = useAiStudioPublisher({
        mode: form.mode,
        generated: generator.generated,
        hasDraftText,
        outputHtmlRef,
        outputPlainTextRef,
        length: form.length,
        withHashtags: form.withHashtags,
        withCta: form.withCta,
        canLinkProduct,
        selectedProduct: products.selectedProduct,
        resetPageState: resetAll,
        lastHistoryIdRef,
    });

    const onEditorPlainTextChange = useCallback((plain: string) => {
        outputPlainTextRef.current = plain;
        const next = plain.trim().length > 0;
        setHasDraftText((prev) => (prev === next ? prev : next));
    }, []);

    const onEditorHtmlChange = useCallback((html: string) => {
        outputHtmlRef.current = html;
    }, []);

    const restoreFromHistoryItem = useCallback(
        (item: { prompt: string; generatedContent: string }) => {
            lastHistoryIdRef.current = null;
            form.setPrompt(item.prompt);
            generator.applyHistorySnapshot(item.generatedContent);
            setHasDraftText(true);
            onSwitchToStudioTab?.();
        },
        [form, generator, onSwitchToStudioTab],
    );

    const value = useMemo(
        () => ({
            form,
            products,
            generator,
            publisher,
            canLinkProduct,
            hasDraftText,
            setHasDraftText,
            onEditorPlainTextChange,
            onEditorHtmlChange,
            resetAll,
            outputPlainTextRef,
            outputHtmlRef,
            restoreFromHistoryItem,
        }),
        [
            form,
            products,
            generator,
            publisher,
            canLinkProduct,
            hasDraftText,
            onEditorPlainTextChange,
            onEditorHtmlChange,
            resetAll,
            restoreFromHistoryItem,
        ],
    );

    return (
        <AiStudioContext.Provider value={value}>
            {children}
        </AiStudioContext.Provider>
    );
}

export function useAiStudio() {
    const context = useContext(AiStudioContext);
    if (!context) {
        throw new Error("useAiStudio must be used within an AiStudioProvider");
    }
    return context;
}
