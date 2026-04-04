import { useCallback, useEffect, useMemo, useState } from "react";
import { feedApi } from "../api/feedApi";
import type { FeedComment } from "../types/feed.types";

export interface UsePostCommentsPaginationArgs {
    postId: string;
    /** Length of comments embedded on the post payload (first page). */
    embeddedCommentCount: number;
    commentsCount: number;
    pageSize?: number;
    /** When false, older comments stay empty and loadMore is a no-op. */
    enabled?: boolean;
}

export function usePostCommentsPagination({
    postId,
    embeddedCommentCount,
    commentsCount,
    pageSize = 5,
    enabled = true,
}: UsePostCommentsPaginationArgs) {
    const [olderComments, setOlderComments] = useState<FeedComment[]>([]);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const totalLoaded = embeddedCommentCount + olderComments.length;
    const hasMore = useMemo(
        () => enabled && commentsCount > totalLoaded,
        [enabled, commentsCount, totalLoaded],
    );

    useEffect(() => {
        setOlderComments([]);
        setPage(1);
    }, [postId]);

    const loadMoreComments = useCallback(async () => {
        if (!enabled || loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const currentOffset = embeddedCommentCount + olderComments.length;
            const res = await feedApi.getComments(postId, nextPage, pageSize, currentOffset);
            const newOlder = [...res.items].reverse();
            setOlderComments((prev) => [...newOlder, ...prev]);
            setPage(nextPage);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    }, [
        enabled,
        loadingMore,
        hasMore,
        page,
        embeddedCommentCount,
        olderComments.length,
        postId,
        pageSize,
    ]);

    return {
        olderComments,
        loadingMore,
        hasMore,
        loadMoreComments,
    };
}
