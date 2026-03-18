import type { FeedComment } from "../types/feed.types";

interface CommentListProps {
    comments: FeedComment[];
}

export function CommentList({ comments }: CommentListProps) {
    if (comments.length === 0) {
        return (
            <p className="text-xs text-slate-500 dark:text-slate-400">
                No comments yet.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
                >
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {comment.author.fullName ?? comment.author.username ?? "User"}
                    </p>
                    <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                        {comment.content}
                    </p>
                </div>
            ))}
        </div>
    );
}

