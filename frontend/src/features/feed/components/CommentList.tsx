import type { FeedComment } from "../types/feed.types";
import { Link } from "react-router-dom";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { Avatar } from "../../../shared/ui";
import { formatTimeAgo } from "../../../shared/lib/formatTimeAgo";
import { useTranslation } from "react-i18next";

interface CommentListProps {
    comments: FeedComment[];
    totalCount?: number;
    onViewMore?: () => void;
}

export function CommentList({ comments, totalCount = 0, onViewMore }: CommentListProps) {
    const { user } = useAuthSession();
    if (comments.length === 0) {
        return null; // Do not render anything if no comments
    }

    const displayComments = [...comments].reverse();
    const hasMore = totalCount > comments.length;
    const { t } = useTranslation();

    return (
        <div className="space-y-3">
            {hasMore && onViewMore && (
                <button
                    type="button"
                    onClick={onViewMore}
                    className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                    {t("feed.viewMoreComments")}
                </button>
            )}
            {displayComments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                    <Avatar
                        src={comment.user?.avatarUrl}
                        alt={comment.user?.fullName ?? comment.user?.username ?? "User"}
                        wrapperClassName="h-8 w-8 shrink-0"
                    />
                    <div className="rounded-2xl bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                <Link
                                    to={
                                        user?.id && user.id === comment.user?.id
                                            ? "/profile"
                                            : `/profile/${comment.user?.id}`
                                    }
                                    className="transition-colors hover:text-primary"
                                >
                                    {comment.user?.fullName ?? comment.user?.username ?? "User"}
                                </Link>
                            </p>
                            <span className="text-xs text-neutral-500 shrink-0">
                                {formatTimeAgo(comment.createdAt)}
                            </span>
                        </div>
                        <p className="mt-0.5 text-neutral-800 dark:text-neutral-200">
                            {comment.content}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
