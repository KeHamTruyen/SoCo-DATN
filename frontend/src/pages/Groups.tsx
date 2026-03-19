import { Compass, Plus, Search, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { groupApi } from "../features/group/api/groupApi";
import { GroupCard } from "../features/group/components/GroupCard";
import type { Group } from "../features/group/types/group.types";
import { Button, UnifiedHeader } from "../shared/ui";

type GroupFilter = "discover" | "suggested" | "popular" | "new";

const FILTER_OPTIONS: { value: GroupFilter; label: string; icon: React.ReactNode }[] = [
    { value: "discover", label: "Discover", icon: <Compass className="h-4 w-4" /> },
    { value: "suggested", label: "Suggested", icon: <Sparkles className="h-4 w-4" /> },
    { value: "popular", label: "Popular", icon: <TrendingUp className="h-4 w-4" /> },
];

const MY_GROUPS_MOCK = [
    { id: "1", name: "Tech Enthusiasts", initials: "TE", color: "bg-info/10 text-info", lastActive: "Active now" },
    { id: "2", name: "Sneakerheads", initials: "SH", color: "bg-primary-100 text-primary", lastActive: "2h ago", badge: "5+" },
    { id: "3", name: "Green Decor", initials: "GD", color: "bg-success/10 text-success", lastActive: "Yesterday" },
];

export default function Groups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<GroupFilter>("discover");

    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await groupApi.listGroups({ q: search || undefined });
                if (!mounted) return;
                setGroups(data.items);
            } catch {
                if (!mounted) return;
                setGroups([]);
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [search]);

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
                <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 flex flex-col gap-1">
                            {FILTER_OPTIONS.map((f) => (
                                <button
                                    key={f.value}
                                    type="button"
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

                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center justify-between px-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                                My Groups
                            </h3>
                            <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-bold dark:bg-neutral-700">
                                {MY_GROUPS_MOCK.length}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            {MY_GROUPS_MOCK.map((g) => (
                                <Link
                                    key={g.id}
                                    to={`/groups/${g.id}`}
                                    className="flex cursor-pointer items-center justify-between rounded-xl p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${g.color}`}
                                        >
                                            {g.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{g.name}</p>
                                            <p className="text-[10px] text-neutral-500">{g.lastActive}</p>
                                        </div>
                                    </div>
                                    {g.badge && (
                                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                            {g.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                        <button type="button" className="mt-4 w-full text-xs font-semibold text-primary hover:underline">
                            View all groups
                        </button>
                    </div>
                </aside>

                <section className="flex flex-1 flex-col gap-6">
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
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Filter groups..."
                                    className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                            </div>
                            <Button className="gap-2 whitespace-nowrap shadow-lg shadow-primary/20">
                                <Plus className="h-4 w-4" />
                                Create Group
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-64 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800"
                                />
                            ))}
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
                            <p className="text-neutral-500">No groups found. Try a different search.</p>
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
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
