import { Check, ChevronDown, LogOut, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "../../../shared/lib/cn";
import type { Group } from "../types/group.types";

const AVATAR_COLORS = [
    "bg-primary-600",
    "bg-primary",
    "bg-success",
    "bg-info",
    "bg-warning",
];

interface GroupCardProps {
    group: Group;
    onJoin?: (groupId: string) => void;
    onLeave?: (groupId: string) => void;
}

export function GroupCard({ group, onJoin, onLeave }: GroupCardProps) {
    const { i18n } = useTranslation();
    const isVietnamese = i18n.language === "vi";
    const colorClass = AVATAR_COLORS[group.name.charCodeAt(0) % AVATAR_COLORS.length];
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const privacyLabel =
        group.privacy?.toUpperCase() === "PUBLIC"
            ? isVietnamese
                ? "Công khai"
                : "Public"
            : isVietnamese
              ? "Riêng tư"
              : "Private";

    useEffect(() => {
        if (!menuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div className="group flex flex-col overflow-visible rounded-2xl border border-neutral-200 bg-white transition-all hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
            <div className="relative h-32 overflow-hidden bg-neutral-200 dark:bg-neutral-700">
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
                <div className="absolute left-4 top-3 z-10">
                    <span className="rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                        {privacyLabel}
                    </span>
                </div>
            </div>

            <div className="relative flex flex-1 flex-col px-4 pb-4 pt-0">
                <div className="-mt-6 mb-4 flex items-start justify-between">
                    <div
                        className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white text-xl font-bold text-white shadow-sm dark:border-neutral-800",
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
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {group.membersCount.toLocaleString()}{" "}
                            {isVietnamese ? "thành viên" : "members"}
                            {group.postsPerDay !== undefined && (
                                <>
                                    {" "}
                                    • {group.postsPerDay}{" "}
                                    {isVietnamese ? "bài/ngày" : "posts/day"}
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {group.description && (
                    <p className="mb-6 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
                        {group.description}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Users className="h-3.5 w-3.5" />
                        {group.friendsInGroup
                            ? isVietnamese
                                ? `${group.friendsInGroup} bạn đã tham gia`
                                : `${group.friendsInGroup} friends joined`
                            : isVietnamese
                              ? "Mở cho mọi người"
                              : "Open to all"}
                    </div>
                    {group.isMember ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((prev) => !prev)}
                                className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-bold text-neutral-700 transition-all hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                            >
                                <Check className="h-4 w-4" />
                                {isVietnamese ? "Đã tham gia" : "Joined"}
                                <ChevronDown
                                    className={cn(
                                        "h-4 w-4 transition-transform",
                                        menuOpen && "rotate-180",
                                    )}
                                />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-full z-10 mt-2 w-40 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onLeave?.(group.id);
                                        }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {isVietnamese ? "Rời nhóm" : "Leave group"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onJoin?.(group.id)}
                            className="rounded-xl bg-primary/10 px-5 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
                        >
                            {isVietnamese ? "Tham gia nhóm" : "Join Group"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
