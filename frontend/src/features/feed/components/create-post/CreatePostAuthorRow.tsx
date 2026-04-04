import { Avatar } from "../../../../shared/ui/atoms/avatar";
import type { PostVisibility } from "../../types/feed.types";

interface CreatePostAuthorRowProps {
    displayName: string;
    avatarUrl?: string | null;
    username?: string | null;
    groupId?: string;
    groupVisibilityLabel: string;
    visibility: PostVisibility;
    onVisibilityChange: (v: PostVisibility) => void;
    visibilityLabel: string;
    visibilityPublic: string;
    visibilityFollowers: string;
    visibilityFollowing: string;
    visibilityPrivate: string;
}

export function CreatePostAuthorRow({
    displayName,
    avatarUrl,
    username,
    groupId,
    groupVisibilityLabel,
    visibility,
    onVisibilityChange,
    visibilityLabel,
    visibilityPublic,
    visibilityFollowers,
    visibilityFollowing,
    visibilityPrivate,
}: CreatePostAuthorRowProps) {
    return (
        <div className="border-b border-neutral-200/90 px-4 py-4 dark:border-neutral-800 sm:px-6 sm:py-5">
            <div className="flex gap-3 sm:gap-4">
                <Avatar
                    src={avatarUrl ?? undefined}
                    alt={displayName}
                    wrapperClassName="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {displayName}
                    </p>
                    {groupId ? (
                        <p className="mt-1 text-sm font-medium text-primary">{groupVisibilityLabel}</p>
                    ) : (
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <label htmlFor="create-post-visibility" className="sr-only">
                                {visibilityLabel}
                            </label>
                            <select
                                id="create-post-visibility"
                                value={visibility}
                                onChange={(e) => onVisibilityChange(e.target.value as PostVisibility)}
                                className="h-9 shrink-0 rounded-lg border border-border bg-muted/40 px-2.5 text-sm font-medium text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="PUBLIC">{visibilityPublic}</option>
                                <option value="FOLLOWERS">{visibilityFollowers}</option>
                                <option value="FOLLOWING">{visibilityFollowing}</option>
                                <option value="PRIVATE">{visibilityPrivate}</option>
                            </select>
                            {username ? (
                                <span className="text-sm text-muted-foreground">@{username}</span>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
