import { Globe, Lock, ShieldCheck, ShoppingBag, ShoppingCart, Users, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useGroupContext } from "../context/GroupContext";
import { Avatar } from "../../../shared/ui";

export function GroupSidebar() {
    const { group } = useGroupContext();

    if (!group) return null;

    const isPublic = group.privacy?.toUpperCase() === "PUBLIC";
    const adminMembers = group.members?.filter((m) => m.role === "ADMIN") ?? [];

    return (
        <aside className="space-y-5">
            {/* About Group */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    About Group
                </h3>
                {group.description ? (
                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                        {group.description}
                    </p>
                ) : (
                    <p className="text-sm italic text-neutral-400">
                        Chưa có mô tả.
                    </p>
                )}
                <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span>Be respectful and helpful</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <XCircle className="h-5 w-5 text-primary" />
                        <span>No spam or self-promotion</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        <span>Tag products in setup posts</span>
                    </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <Users className="h-4 w-4" />
                        {group.membersCount.toLocaleString()} members
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                        {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        {isPublic ? "Public" : "Private"} group
                    </div>
                </div>
            </div>

            {/* Admins */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Admins
                </h3>
                <div className="space-y-3">
                    {adminMembers.length > 0 ? (
                        adminMembers.map((m) => (
                            <Link
                                key={m.userId}
                                to={`/profile/${m.userId}`}
                                className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            >
                                <Avatar
                                    src={m.user.avatarUrl}
                                    alt={m.user.fullName ?? m.user.username ?? "Admin"}
                                    wrapperClassName="h-8 w-8 shrink-0"
                                />
                                <div>
                                    <p className="text-sm font-bold">
                                        {m.user.fullName ?? m.user.username ?? "Admin"}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-tighter text-neutral-400">
                                        {m.userId === group.createdBy ? "Founder" : "Admin"}
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : group.creator ? (
                        <Link
                            to={`/profile/${group.creator.id}`}
                            className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                            <Avatar
                                src={group.creator.avatarUrl}
                                alt={group.creator.fullName ?? group.creator.username ?? "Founder"}
                                wrapperClassName="h-8 w-8 shrink-0"
                            />
                            <div>
                                <p className="text-sm font-bold">
                                    {group.creator.fullName ?? group.creator.username ?? "Founder"}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-tighter text-neutral-400">
                                    Founder
                                </p>
                            </div>
                        </Link>
                    ) : null}
                </div>
            </div>

            {/* Featured Products */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Featured Products
                </h3>
                <div className="flex flex-col items-center gap-3 py-4 text-center text-neutral-400">
                    <ShoppingBag className="h-8 w-8 opacity-40" />
                    <p className="text-xs">Chưa có sản phẩm nào.</p>
                </div>
                <button
                    type="button"
                    className="mt-3 w-full rounded-lg border border-primary/30 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
                >
                    Khám phá thêm
                </button>
            </div>
        </aside>
    );
}
