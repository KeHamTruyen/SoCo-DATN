import { Link } from "react-router-dom";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { cn } from "../../../shared/lib/cn";
import { formatTimeAgo } from "../../../shared/lib/formatTimeAgo";
import type { FeedPost } from "../types/feed.types";
import { PostVisibilityInline } from "./PostVisibilityInline";

export interface PostAuthorMetaHeaderProps {
    post: FeedPost;
    variant: "compact" | "detail";
    /** Override author profile link (e.g. "/profile" when viewing own post). */
    authorProfilePath?: string;
}

export function PostAuthorMetaHeader({ post, variant, authorProfilePath }: PostAuthorMetaHeaderProps) {
    const { user } = useAuthSession();
    const resolvedAuthorPath =
        authorProfilePath ??
        (user?.id && user.id === post.author.id ? "/profile" : `/profile/${post.author.id}`);

    const isCompact = variant === "compact";
    const titleGroupClass = isCompact
        ? "block truncate text-sm font-bold text-neutral-900 hover:text-primary hover:underline dark:text-neutral-100"
        : "block font-semibold text-neutral-900 hover:text-primary hover:underline dark:text-neutral-100";
    const titleAuthorClass = isCompact
        ? "block truncate text-sm font-bold text-neutral-900 hover:text-primary hover:underline dark:text-neutral-100"
        : "font-semibold text-neutral-900 hover:text-primary hover:underline dark:text-neutral-100";
    const metaClass = isCompact
        ? "mt-0.5 flex flex-wrap items-center gap-x-1 text-[11px] text-neutral-500 dark:text-neutral-400"
        : "text-xs text-neutral-500 flex flex-wrap items-center gap-x-1";
    const sublineClass = isCompact
        ? "text-[11px] text-neutral-500 dark:text-neutral-400"
        : "text-xs text-neutral-500";
    const feelingClass = isCompact
        ? "text-[11px] font-medium text-primary"
        : "mt-0.5 text-xs font-medium text-primary";

    if (post.group) {
        return (
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        "relative shrink-0",
                        isCompact ? "h-10 w-10" : "h-11 w-11",
                    )}
                >
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                        {post.group.avatarUrl ? (
                            <img
                                src={post.group.avatarUrl}
                                alt={isCompact ? "" : post.group.name}
                                className="h-full w-full rounded-lg object-cover"
                            />
                        ) : (
                            post.group.name.slice(0, 2).toUpperCase()
                        )}
                    </div>
                    <Avatar
                        src={post.author.avatarUrl}
                        alt={post.author.fullName ?? post.author.email ?? ""}
                        wrapperClassName="absolute -bottom-1 -right-1 h-6 w-6 border-2 border-white dark:border-neutral-900"
                    />
                </div>
                <div className="min-w-0">
                    <Link to={`/groups/${post.group.id}`} className={titleGroupClass}>
                        {post.group.name}
                    </Link>
                    <p className={sublineClass}>
                        <Link
                            to={resolvedAuthorPath}
                            className="font-medium text-neutral-700 hover:text-primary hover:underline dark:text-neutral-300"
                        >
                            {post.author.fullName ?? post.author.username ?? "User"}
                        </Link>
                        {!isCompact &&
                        post.author.username &&
                        post.author.fullName &&
                        post.author.username !== post.author.fullName
                            ? ` · @${post.author.username}`
                            : null}
                    </p>
                    <p className={metaClass}>
                        <PostVisibilityInline visibility={post.visibility} />
                        <span className="text-neutral-400 dark:text-neutral-500" aria-hidden>
                            ·
                        </span>
                        <span>{formatTimeAgo(post.createdAt)}</span>
                        {post.location ? (
                            <>
                                <span className="text-neutral-400 dark:text-neutral-500" aria-hidden>
                                    ·
                                </span>
                                <span>{post.location}</span>
                            </>
                        ) : null}
                    </p>
                    {post.feeling ? <p className={feelingClass}>{post.feeling}</p> : null}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <Avatar
                src={post.author.avatarUrl}
                alt={post.author.fullName ?? post.author.email ?? ""}
                wrapperClassName={isCompact ? "h-10 w-10 shrink-0 border-2 border-primary" : undefined}
            />
            <div className="min-w-0">
                <Link to={resolvedAuthorPath} className={titleAuthorClass}>
                    {post.author.fullName ?? post.author.username ?? "User"}
                </Link>
                <p className={metaClass}>
                    <PostVisibilityInline visibility={post.visibility} />
                    <span className="text-neutral-400 dark:text-neutral-500" aria-hidden>
                        ·
                    </span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                    {post.location ? (
                        <>
                            <span className="text-neutral-400 dark:text-neutral-500" aria-hidden>
                                ·
                            </span>
                            <span>{post.location}</span>
                        </>
                    ) : null}
                </p>
                {post.feeling ? <p className={feelingClass}>{post.feeling}</p> : null}
            </div>
        </div>
    );
}
