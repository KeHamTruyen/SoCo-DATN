import { useCallback, useEffect, useState } from "react";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { savedItemsApi } from "../../saved-items/api/savedItemsApi";
import { useSavedPostsStatusOptional } from "../context/SavedPostsStatusContext";

export function useSavedPostItem(postId: string) {
    const batchContext = useSavedPostsStatusOptional();
    const { isAuthenticated } = useAuthSession();
    const [savedId, setSavedId] = useState<string | null>(null);
    const [saveBusy, setSaveBusy] = useState(false);

    useEffect(() => {
        if (batchContext) return;
        if (!isAuthenticated) {
            setSavedId(null);
            return;
        }
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
    }, [postId, isAuthenticated, batchContext]);

    const toggleSave = useCallback(() => {
        if (batchContext) {
            batchContext.toggleSave(postId);
            return;
        }
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
                // ignore
            } finally {
                setSaveBusy(false);
            }
        })();
    }, [batchContext, postId, savedId, saveBusy]);

    if (batchContext) {
        return {
            savedId: batchContext.getSavedId(postId),
            saveBusy: batchContext.saveBusy,
            toggleSave,
        };
    }

    return { savedId, saveBusy, toggleSave };
}
