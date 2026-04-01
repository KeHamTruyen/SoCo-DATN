import { X } from "lucide-react";
import { Button } from "../../../shared/ui/atoms/button";
import type { FeedPost } from "../types/feed.types";
import { PostDetailView } from "./PostDetailView";

interface PostDetailModalProps {
    post: FeedPost;
    onClose: () => void;
    onLike: () => void;
    onComment: (content: string) => void;
    onDeletePost?: (postId: string) => Promise<void> | void;
}

export function PostDetailModal({ post, onClose, onLike, onComment, onDeletePost }: PostDetailModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-0 backdrop-blur-sm sm:p-4 md:p-8">
            <div className="relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-xl bg-background-light shadow-2xl dark:bg-background-dark sm:rounded-xl">
                <div className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70">
                    <button type="button" onClick={onClose} aria-label="Close modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-auto bg-transparent">
                    <PostDetailView
                        post={post}
                        onLike={onLike}
                        onComment={onComment}
                        onDeletePost={onDeletePost}
                    />
                </div>
            </div>
        </div>
    );
}
