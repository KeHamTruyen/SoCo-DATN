import { useCallback, useState } from "react";
import { uploadApi } from "../../upload/api/uploadApi";

interface UseChatActionsOptions {
    sendMessage: (
        conversationId: string,
        body:
            | string
            | { messageType: "IMAGE"; mediaUrl: string; content?: string | null },
    ) => Promise<unknown>;
}

/**
 * Shared send-text and send-image logic used by both MessageDock and Messages page.
 * Eliminates the duplicated handleSend / handleAttachImage implementations.
 */
export function useChatActions({ sendMessage }: UseChatActionsOptions) {
    const [sendingId, setSendingId] = useState<string | null>(null);

    const handleSend = useCallback(
        async (conversationId: string, text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return;
            setSendingId(conversationId);
            try {
                await sendMessage(conversationId, trimmed);
            } finally {
                setSendingId(null);
            }
        },
        [sendMessage],
    );

    const handleAttachImage = useCallback(
        async (conversationId: string, file: File) => {
            setSendingId(conversationId);
            try {
                const { url } = await uploadApi.uploadPostMedia(file);
                await sendMessage(conversationId, {
                    messageType: "IMAGE",
                    mediaUrl: url,
                });
            } finally {
                setSendingId(null);
            }
        },
        [sendMessage],
    );

    const isSending = useCallback(
        (conversationId: string) => sendingId === conversationId,
        [sendingId],
    );

    return { sendingId, handleSend, handleAttachImage, isSending };
}
