import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { savedItemsApi } from "../../saved-items/api/savedItemsApi";

type SavedMap = Record<string, string | null>;

interface SavedPostsStatusContextValue {
    getSavedId: (postId: string) => string | null;
    saveBusy: boolean;
    toggleSave: (postId: string) => void;
}

const SavedPostsStatusContext = createContext<SavedPostsStatusContextValue | null>(null);

export function SavedPostsStatusProvider({
    postIds,
    children,
}: {
    postIds: string[];
    children: ReactNode;
}) {
    const { isAuthenticated } = useAuthSession();
    const [savedByPostId, setSavedByPostId] = useState<SavedMap>({});
    const [saveBusy, setSaveBusy] = useState(false);
    const lastFetchedKeyRef = useRef("");

    const postIdsKey = useMemo(
        () => [...new Set(postIds.filter(Boolean))].sort().join(","),
        [postIds],
    );

    useEffect(() => {
        if (!isAuthenticated || !postIdsKey) {
            setSavedByPostId({});
            lastFetchedKeyRef.current = "";
            return;
        }
        if (lastFetchedKeyRef.current === postIdsKey) return;

        let cancelled = false;
        const ids = postIdsKey.split(",").filter(Boolean);
        void (async () => {
            try {
                const byTargetId = await savedItemsApi.lookupBatch("POST", ids);
                if (cancelled) return;
                lastFetchedKeyRef.current = postIdsKey;
                setSavedByPostId(byTargetId);
            } catch {
                if (!cancelled) setSavedByPostId({});
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, postIdsKey]);

    const getSavedId = useCallback(
        (postId: string) => savedByPostId[postId] ?? null,
        [savedByPostId],
    );

    const toggleSave = useCallback(
        (postId: string) => {
            if (saveBusy || !isAuthenticated) return;
            setSaveBusy(true);
            void (async () => {
                try {
                    const current = savedByPostId[postId] ?? null;
                    if (current) {
                        await savedItemsApi.remove(current);
                        setSavedByPostId((prev) => ({ ...prev, [postId]: null }));
                    } else {
                        const row = await savedItemsApi.save("POST", postId);
                        setSavedByPostId((prev) => ({ ...prev, [postId]: row.id }));
                    }
                } catch {
                    // ignore
                } finally {
                    setSaveBusy(false);
                }
            })();
        },
        [saveBusy, isAuthenticated, savedByPostId],
    );

    const value = useMemo(
        () => ({ getSavedId, saveBusy, toggleSave }),
        [getSavedId, saveBusy, toggleSave],
    );

    return (
        <SavedPostsStatusContext.Provider value={value}>{children}</SavedPostsStatusContext.Provider>
    );
}

export function useSavedPostsStatusOptional() {
    return useContext(SavedPostsStatusContext);
}
