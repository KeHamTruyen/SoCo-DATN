import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

export default function GroupPostDetail() {
    const { groupId, postId } = useParams<{ groupId: string; postId: string }>();
    if (postId) {
        return <Navigate to={`/post/${postId}`} replace />;
    }

    return (
        <main className="mx-auto w-full max-w-360 flex-1 px-4 py-6 sm:px-6">
            <Link
                to={`/groups/${groupId}`}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-primary"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Group
            </Link>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                Dang chuyen den bai viet...
            </div>
        </main>
    );
}
