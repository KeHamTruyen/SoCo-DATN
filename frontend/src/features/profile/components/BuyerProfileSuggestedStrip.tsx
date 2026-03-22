import { useState } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_USER_AVATAR_URL } from "../../../shared/config/defaultAssets";
import { profileApi } from "../api/profileApi";
import type { PublicUserProfile } from "../types/profile.types";

interface BuyerProfileSuggestedStripProps {
    users: PublicUserProfile[];
    loading?: boolean;
}

export function BuyerProfileSuggestedStrip({ users, loading }: BuyerProfileSuggestedStripProps) {
    const [followed, setFollowed] = useState<Set<string>>(new Set());

    const handleFollow = (userId: string) => {
        setFollowed((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
                void profileApi.unfollowUser(userId);
            } else {
                next.add(userId);
                void profileApi.followUser(userId);
            }
            return next;
        });
    };

    if (!loading && users.length === 0) return null;

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold dark:text-white">Gợi ý cho bạn</h3>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Xem thêm</span>
            </div>
            {loading ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-40 w-48 shrink-0 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
                        />
                    ))}
                </div>
            ) : (
                <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
                    {users.map((u) => (
                        <div
                            key={u.id}
                            className="w-48 shrink-0 rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-center dark:border-neutral-700 dark:bg-neutral-800/50"
                        >
                            <Link to={`/profile/${u.id}`} className="block">
                                <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                    <img
                                        src={u.avatarUrl ?? DEFAULT_USER_AVATAR_URL}
                                        alt={u.fullName}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <p className="truncate text-sm font-semibold dark:text-neutral-100">{u.fullName}</p>
                                <p className="mb-3 truncate text-xs text-neutral-500 dark:text-neutral-400">
                                    {u.username ? `@${u.username}` : u.role === "seller" ? "Shop" : "Người mua"}
                                </p>
                            </Link>
                            <button
                                type="button"
                                onClick={() => handleFollow(u.id)}
                                className={`w-full rounded-lg border py-1.5 text-xs font-bold transition-all ${
                                    followed.has(u.id)
                                        ? "border-neutral-300 text-neutral-500 dark:border-neutral-600"
                                        : "border-primary text-primary hover:bg-primary hover:text-white dark:border-primary"
                                }`}
                            >
                                {followed.has(u.id) ? "Đang theo dõi" : "Theo dõi"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
