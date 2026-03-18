import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../../shared/lib/cn";
import type { Group } from "../types/group.types";

const AVATAR_COLORS = [
    "bg-blue-600",
    "bg-primary",
    "bg-green-600",
    "bg-purple-600",
    "bg-pink-600",
];

interface GroupCardProps {
    group: Group;
    onJoin?: (groupId: string) => void;
}

export function GroupCard({ group, onJoin }: GroupCardProps) {
    const colorClass = AVATAR_COLORS[group.name.charCodeAt(0) % AVATAR_COLORS.length];

    return (
        <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="relative h-32 overflow-hidden bg-slate-200 dark:bg-slate-700">
                {group.coverImageUrl ? (
                    <img
                        src={group.coverImageUrl}
                        alt={group.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className={cn("h-full w-full", colorClass, "opacity-20")} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                    <span className="rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                        {group.privacy}
                    </span>
                </div>
            </div>

            <div className="relative flex flex-1 flex-col px-4 pb-4 pt-0">
                <div className="-mt-6 mb-4 flex items-start justify-between">
                    <div
                        className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white text-xl font-bold text-white shadow-sm dark:border-slate-800",
                            colorClass,
                        )}
                    >
                        {group.avatarInitials ?? group.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="pt-8">
                        <h4 className="text-lg font-bold leading-tight">
                            <Link
                                to={`/groups/${group.id}`}
                                className="transition-colors hover:text-primary"
                            >
                                {group.name}
                            </Link>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {group.membersCount.toLocaleString()} members
                            {group.postsPerDay !== undefined && (
                                <> • {group.postsPerDay} posts/day</>
                            )}
                        </p>
                    </div>
                </div>

                {group.description && (
                    <p className="mb-6 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                        {group.description}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        {group.friendsInGroup
                            ? `${group.friendsInGroup} friends joined`
                            : "Open to all"}
                    </div>
                    {group.isMember ? (
                        <Link
                            to={`/groups/${group.id}`}
                            className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        >
                            View
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onJoin?.(group.id)}
                            className="rounded-xl bg-primary/10 px-5 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
                        >
                            Join Group
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
