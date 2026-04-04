import { X } from "lucide-react";
import type { TaggedUserBrief } from "../../types/feed.types";

interface CreatePostMetaChipsProps {
    productLabel: string | null;
    productLabelPrefix: string;
    taggedUsers: TaggedUserBrief[];
    feeling: string | null;
    location: string;
    onRemoveTaggedUser: (id: string) => void;
}

export function CreatePostMetaChips({
    productLabel,
    productLabelPrefix,
    taggedUsers,
    feeling,
    location,
    onRemoveTaggedUser,
}: CreatePostMetaChipsProps) {
    if (!productLabel && taggedUsers.length === 0 && !feeling && !location.trim()) return null;

    return (
        <div className="flex flex-wrap gap-2 px-4 pb-2 text-xs sm:px-6">
            {productLabel ? (
                <span className="rounded-full bg-success/15 px-2 py-1 font-medium text-success">
                    {productLabelPrefix}: {productLabel}
                </span>
            ) : null}
            {taggedUsers.map((u) => (
                <span
                    key={u.id}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 font-medium text-primary"
                >
                    @{u.username ?? u.fullName}
                    <button
                        type="button"
                        className="ml-0.5 rounded-full hover:bg-primary/20"
                        onClick={() => onRemoveTaggedUser(u.id)}
                        aria-label="Remove tag"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
            {feeling ? (
                <span className="rounded-full bg-muted px-2 py-1 font-medium">{feeling}</span>
            ) : null}
            {location.trim() ? (
                <span className="rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground">
                    📍 {location.trim()}
                </span>
            ) : null}
        </div>
    );
}
