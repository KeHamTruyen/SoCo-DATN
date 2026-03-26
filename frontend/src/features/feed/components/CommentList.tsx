import type { FeedComment } from "../types/feed.types";

interface CommentListProps {
    comments: FeedComment[];
}

export function CommentList({ comments }: CommentListProps) {
    if (comments.length === 0) {
        return (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                No comments yet.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className="rounded-lg bg-neutral-50 px-3 py-2 text-sm dark:bg-neutral-800"
                >
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {comment.user?.fullName ?? comment.user?.username ?? "User"}
                    </p>
                    <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">
                        {comment.content}
                    </p>
                </div>
            ))}
        </div>
    );
}
