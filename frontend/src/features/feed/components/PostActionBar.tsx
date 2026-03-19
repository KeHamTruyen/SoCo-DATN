import { Heart, MessageCircle } from "lucide-react";
import { Button } from "../../../shared/ui";

interface PostActionBarProps {
    likesCount: number;
    commentsCount: number;
    likedByMe?: boolean;
    onLike: () => void;
}

export function PostActionBar({
    likesCount,
    commentsCount,
    likedByMe,
    onLike,
}: PostActionBarProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className={likedByMe ? "text-primary" : ""}
                onClick={onLike}
            >
                <Heart className={`h-4 w-4 ${likedByMe ? "fill-current" : ""}`} />
                {likesCount}
            </Button>
            <div className="inline-flex items-center gap-1 px-3 text-xs text-neutral-500 dark:text-neutral-400">
                <MessageCircle className="h-4 w-4" />
                {commentsCount}
            </div>
        </div>
    );
}
