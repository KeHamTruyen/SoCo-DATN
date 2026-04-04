import { useCallback, useEffect, useState } from "react";
import { savedItemsApi } from "../../saved-items/api/savedItemsApi";

export function useSavedPostItem(postId: string) {
    const [savedId, setSavedId] = useState<string | null>(null);
    const [saveBusy, setSaveBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const id = await savedItemsApi.lookup("POST", postId);
                if (!cancelled) setSavedId(id);
            } catch {
                if (!cancelled) setSavedId(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [postId]);

    const toggleSave = useCallback(() => {
        if (saveBusy) return;
        setSaveBusy(true);
        void (async () => {
            try {
                if (savedId) {
                    await savedItemsApi.remove(savedId);
                    setSavedId(null);
                } else {
                    const row = await savedItemsApi.save("POST", postId);
                    setSavedId(row.id);
                }
            } catch {
                /* ignore */
            } finally {
                setSaveBusy(false);
            }
        })();
    }, [postId, savedId, saveBusy]);

    return { savedId, saveBusy, toggleSave };
}
