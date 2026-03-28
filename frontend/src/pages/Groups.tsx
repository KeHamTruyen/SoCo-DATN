import {
    Clock,
    Compass,
    Plus,
    Search,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreateGroupModal } from "../features/group/components/CreateGroupModal";
import { GroupCard } from "../features/group/components/GroupCard";
import { groupApi } from "../features/group/api/groupApi";
import type { Group } from "../features/group/types/group.types";
import { UnifiedHeader } from "../shared/ui";

type GroupFilter = "discover" | "suggested" | "popular" | "new";

const FILTER_OPTIONS: { value: GroupFilter; label: string; icon: React.ReactNode }[] = [
    { value: "discover", label: "Discover", icon: <Compass className="h-4 w-4" /> },
    { value: "suggested", label: "Suggested", icon: <Sparkles className="h-4 w-4" /> },
    { value: "popular", label: "Popular", icon: <TrendingUp className="h-4 w-4" /> },
    { value: "new", label: "New Arrivals", icon: <Clock className="h-4 w-4" /> },
];

const AVATAR_COLORS = [
    "bg-blue-600",
    "bg-primary",
    "bg-emerald-600",
    "bg-red-600",
    "bg-yellow-600",
    "bg-violet-600",
];

function getAvatarColor(name: string) {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function Groups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<GroupFilter>("discover");
    const [createModalOpen, setCreateModalOpen] = useState(false);

    /* ─── Fetch public group list ─── */
    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await groupApi.listGroups({ q: search || undefined });
                if (!mounted) return;
                setGroups(data?.items ?? []);
            } catch {
                if (!mounted) return;
                setGroups([]);
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [search]);

    /* ─── Fetch my groups for sidebar ─── */
    useEffect(() => {
        let mounted = true;
        void (async () => {
            try {
                const data = await groupApi.getMyGroups();
                if (!mounted) return;
                setMyGroups(data?.items ?? []);
            } catch {
                if (!mounted) return;
                setMyGroups([]);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleJoin = async (groupId: string) => {
        try {
            await groupApi.joinGroup(groupId);
            setGroups((prev) =>
                prev.map((g) =>
                    g.id === groupId
                        ? { ...g, isMember: true, membersCount: g.membersCount + 1 }
                        : g,
                ),
            );
        } catch {
            // silently ignore
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/feed"
            />

            <main className="mx-auto flex w-full max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* ── Sidebar ── */}
                <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
                    {/* Navigation filters */}
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                            Navigation
                        </h3>
                        <div className="flex flex-col gap-1">
                            {FILTER_OPTIONS.map((f) => (
                                <button
                                    key={f.value}
                                    type="button"
                                    id={`filter-${f.value}`}
                                    onClick={() => setActiveFilter(f.value)}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                                        activeFilter === f.value
                                            ? "bg-primary text-white"
                                            : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                    }`}
                                >
                                    {f.icon}
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* My groups */}
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-3 flex items-center justify-between px-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                                My Groups
                            </h3>
                            {myGroups.length > 0 && (
                                <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-bold dark:bg-neutral-700">
                                    {myGroups.length}
                                </span>
                            )}
                        </div>

                        {myGroups.length === 0 ? (
                            <p className="px-2 text-xs text-neutral-400">
                                Bạn chưa tham gia nhóm nào.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {myGroups.slice(0, 5).map((g) => (
                                    <Link
                                        key={g.id}
                                        to={`/groups/${g.id}`}
                                        className="flex cursor-pointer items-center justify-between rounded-xl p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white ${getAvatarColor(g.name)}`}
                                            >
                                                {g.avatarInitials ?? g.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold line-clamp-1">{g.name}</p>
                                                <p className="text-[10px] text-neutral-500">
                                                    {g.membersCount.toLocaleString()} thành viên
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className="mt-4 w-full text-xs font-semibold text-primary hover:underline"
                        >
                            + Tạo nhóm mới
                        </button>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <section className="flex flex-1 flex-col gap-6 min-w-0">
                    {/* Title + search + create button */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Discover Groups</h1>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Join communities based on your interests and shopping style.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <input
                                    id="groups-search-input"
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Filter groups..."
                                    className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                            </div>
                            <button
                                id="create-group-btn"
                                type="button"
                                onClick={() => setCreateModalOpen(true)}
                                className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" />
                                Create Group
                            </button>
                        </div>
                    </div>

                    {/* Group cards grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-72 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800"
                                />
                            ))}
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
                            <p className="text-neutral-500">
                                Không tìm thấy nhóm nào. Hãy thử từ khóa khác.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {groups.map((group) => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    onJoin={(id) => void handleJoin(id)}
                                />
                            ))}

                            {/* "Can't find a group?" card */}
                            <div
                                onClick={() => setCreateModalOpen(true)}
                                className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-neutral-300 p-8 text-center transition-all hover:border-primary/40 hover:bg-primary/5 dark:border-neutral-700 dark:hover:border-primary/40 dark:hover:bg-primary/5"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 transition-all hover:bg-primary/10 hover:text-primary dark:bg-neutral-800">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-700 dark:text-neutral-200">
                                        Không tìm thấy nhóm phù hợp?
                                    </h4>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        Tạo cộng đồng của riêng bạn và mời bạn bè tham gia!
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    Bắt đầu nhóm mới
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* Create Group Modal */}
            <CreateGroupModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            />
        </div>
    );
}
