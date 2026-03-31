import { Compass, Plus, Search, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CreateGroupModal } from "../features/group/components/CreateGroupModal";
import { GroupCard } from "../features/group/components/GroupCard";
import { groupApi } from "../features/group/api/groupApi";
import type { Group } from "../features/group/types/group.types";
import { HttpError } from "../shared/api/httpClient";
import { UnifiedHeader } from "../shared/ui";

type GroupFilter = "discover" | "suggested" | "popular";

const FILTER_OPTIONS: {
    value: GroupFilter;
    label: string;
    icon: React.ReactNode;
}[] = [
    {
        value: "discover",
        label: "Discover",
        icon: <Compass className="h-4 w-4" />,
    },
    {
        value: "suggested",
        label: "Suggested",
        icon: <Sparkles className="h-4 w-4" />,
    },
    {
        value: "popular",
        label: "Popular",
        icon: <TrendingUp className="h-4 w-4" />,
    },
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

const MY_GROUPS_PAGE_SIZE = 5;

function getCreatedAtTime(group: Group) {
    if (!group.createdAt) return 0;
    const parsed = new Date(group.createdAt).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
}

function getDiscoverScore(group: Group) {
    const freshnessBoost = Math.max(
        0,
        60 - Math.floor((Date.now() - getCreatedAtTime(group)) / (1000 * 60 * 60 * 24)),
    );

    return (
        (group.isMember ? -1000 : 0) +
        group.friendsInGroup * 25 +
        group.postsPerDay * 10 +
        group.postsCount * 2 +
        group.membersCount * 0.08 +
        freshnessBoost
    );
}

function getSuggestedScore(group: Group, preferredCategories: Set<string>) {
    const normalizedCategory = group.category?.trim().toLowerCase() ?? "";
    const categoryBoost =
        normalizedCategory && preferredCategories.has(normalizedCategory) ? 80 : 0;

    return (
        group.friendsInGroup * 50 +
        categoryBoost +
        group.postsPerDay * 12 +
        group.postsCount * 3 +
        Math.min(group.membersCount, 500) * 0.05
    );
}

function getPopularScore(group: Group) {
    return group.membersCount * 0.7 + group.postsPerDay * 25 + group.postsCount * 2;
}

export default function Groups() {
    const { i18n } = useTranslation();
    const isVietnamese = i18n.language === "vi";
    const [groups, setGroups] = useState<Group[]>([]);
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<GroupFilter>("discover");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [visibleMyGroupsCount, setVisibleMyGroupsCount] =
        useState(MY_GROUPS_PAGE_SIZE);
    const [leaveTargetGroup, setLeaveTargetGroup] = useState<Group | null>(null);
    const [leaveError, setLeaveError] = useState<string | null>(null);
    const [isLeaving, setIsLeaving] = useState(false);

    /* ─── Fetch public group list ─── */
    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await groupApi.listGroups({
                    q: search || undefined,
                });
                if (!mounted) return;
                setGroups(data?.items ?? []);
            } catch {
                if (!mounted) return;
                setGroups([]);
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
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
        return () => {
            mounted = false;
        };
    }, []);

    const handleJoin = async (groupId: string) => {
        try {
            await groupApi.joinGroup(groupId);
            let joinedGroup: Group | null = null;

            setGroups((prev) =>
                prev.map((g) => {
                    if (g.id !== groupId) return g;

                    joinedGroup = {
                        ...g,
                        isMember: true,
                        membersCount: g.membersCount + 1,
                    };

                    return joinedGroup;
                }),
            );

            if (joinedGroup) {
                setMyGroups((prev) => {
                    if (prev.some((group) => group.id === groupId)) {
                        return prev;
                    }

                    return [joinedGroup as Group, ...prev];
                });
            }
        } catch {
            // silently ignore
        }
    };

    const handleLeave = async (groupId: string) => {
        try {
            await groupApi.leaveGroup(groupId);

            setGroups((prev) =>
                prev.map((g) =>
                    g.id === groupId
                        ? {
                              ...g,
                              isMember: false,
                              membersCount: Math.max(0, g.membersCount - 1),
                          }
                        : g,
                ),
            );

            setMyGroups((prev) => prev.filter((group) => group.id !== groupId));
            return true;
        } catch (error) {
            if (error instanceof HttpError) {
                setLeaveError(error.message);
            } else {
                setLeaveError(
                    isVietnamese
                        ? "Không thể rời nhóm lúc này. Vui lòng thử lại."
                        : "Unable to leave this group right now. Please try again.",
                );
            }
            return false;
        }
    };

    const openLeaveConfirmation = (groupId: string) => {
        const target =
            groups.find((group) => group.id === groupId) ??
            myGroups.find((group) => group.id === groupId) ??
            null;
        setLeaveTargetGroup(target);
        setLeaveError(null);
    };

    const closeLeaveConfirmation = () => {
        if (isLeaving) return;
        setLeaveTargetGroup(null);
        setLeaveError(null);
    };

    const confirmLeaveGroup = async () => {
        if (!leaveTargetGroup) return;
        setIsLeaving(true);
        const didLeave = await handleLeave(leaveTargetGroup.id);
        setIsLeaving(false);
        if (didLeave) {
            setLeaveTargetGroup(null);
        }
    };

    useEffect(() => {
        setVisibleMyGroupsCount(MY_GROUPS_PAGE_SIZE);
    }, [myGroups]);

    const preferredCategories = useMemo(
        () =>
            new Set(
                myGroups
                    .map((group) => group.category?.trim().toLowerCase())
                    .filter((category): category is string => Boolean(category)),
            ),
        [myGroups],
    );

    const visibleMyGroups = useMemo(
        () => myGroups.slice(0, visibleMyGroupsCount),
        [myGroups, visibleMyGroupsCount],
    );

    const hasMoreMyGroups = visibleMyGroupsCount < myGroups.length;
    const myGroupIds = useMemo(
        () => new Set(myGroups.map((group) => group.id)),
        [myGroups],
    );

    const displayedGroups = useMemo(() => {
        const normalizedGroups = groups.map((group) => ({
            ...group,
            isMember: group.isMember || myGroupIds.has(group.id),
            friendsInGroup: group.friendsInGroup ?? 0,
            postsCount: group.postsCount ?? 0,
            postsPerDay: group.postsPerDay ?? 0,
        }));

        switch (activeFilter) {
            case "suggested":
                return normalizedGroups
                    .filter((group) => !group.isMember)
                    .sort(
                        (a, b) =>
                            getSuggestedScore(b, preferredCategories) -
                            getSuggestedScore(a, preferredCategories),
                    );
            case "popular":
                return normalizedGroups.sort(
                    (a, b) => getPopularScore(b) - getPopularScore(a),
                );
            case "discover":
            default:
                return normalizedGroups.sort(
                    (a, b) => getDiscoverScore(b) - getDiscoverScore(a),
                );
        }
    }, [activeFilter, groups, myGroupIds, preferredCategories]);

    const filterDescriptions: Record<GroupFilter, string> = {
        discover:
            isVietnamese
                ? "Cân bằng giữa độ mới, mức độ hoạt động và tín hiệu xã hội để bạn dễ khám phá nhóm phù hợp."
                : "Balanced by freshness, activity, and social signals to help you discover relevant groups.",
        suggested:
            isVietnamese
                ? "Ưu tiên nhóm có bạn bè cùng tham gia, cùng chủ đề với các nhóm bạn đã vào và đang hoạt động tốt."
                : "Prioritizes groups with friends inside, matching categories, and healthy activity.",
        popular:
            isVietnamese
                ? "Xếp hạng theo quy mô thành viên và nhịp độ thảo luận để đẩy các cộng đồng sôi động nhất lên đầu."
                : "Ranks groups by community size and discussion pace to surface the most active ones first.",
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
                            {isVietnamese ? "Điều hướng" : "Navigation"}
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
                                {isVietnamese ? "Nhóm của tôi" : "My Groups"}
                            </h3>
                            {myGroups.length > 0 && (
                                <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-bold dark:bg-neutral-700">
                                    {myGroups.length}
                                </span>
                            )}
                        </div>

                        {myGroups.length === 0 ? (
                            <p className="px-2 text-xs text-neutral-400">
                                {isVietnamese
                                    ? "Bạn chưa tham gia nhóm nào."
                                    : "You haven't joined any groups yet."}
                            </p>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {visibleMyGroups.map((g) => (
                                    <Link
                                        key={g.id}
                                        to={`/groups/${g.id}`}
                                        className="flex cursor-pointer items-center justify-between rounded-xl p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white ${getAvatarColor(g.name)}`}
                                            >
                                                {g.avatarInitials ??
                                                    g.name
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold line-clamp-1">
                                                    {g.name}
                                                </p>
                                                <p className="text-[10px] text-neutral-500">
                                                    {g.membersCount.toLocaleString()}{" "}
                                                    {isVietnamese ? "thành viên" : "members"}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {hasMoreMyGroups && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setVisibleMyGroupsCount(
                                                (prev) => prev + MY_GROUPS_PAGE_SIZE,
                                            )
                                        }
                                        className="mt-2 rounded-xl px-2 py-2 text-left text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
                                    >
                                        {isVietnamese
                                            ? "Tải thêm nhóm"
                                            : "Load more groups"}
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className="mt-4 w-full text-xs font-semibold text-primary hover:underline"
                        >
                            {isVietnamese ? "+ Tạo nhóm mới" : "+ Create new group"}
                        </button>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <section className="flex flex-1 flex-col gap-6 min-w-0">
                    {/* Title + search + create button */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isVietnamese ? "Khám phá nhóm" : "Discover Groups"}
                            </h1>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                {isVietnamese
                                    ? "Tham gia cộng đồng dựa trên sở thích và phong cách mua sắm của bạn."
                                    : "Join communities based on your interests and shopping style."}
                            </p>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                {filterDescriptions[activeFilter]}
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
                                    placeholder={
                                        isVietnamese
                                            ? "Lọc nhóm..."
                                            : "Filter groups..."
                                    }
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
                                {isVietnamese ? "Tạo nhóm" : "Create Group"}
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
                    ) : displayedGroups.length === 0 ? (
                        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
                            <p className="text-neutral-500">
                                {isVietnamese
                                    ? "Không tìm thấy nhóm nào. Hãy thử từ khóa khác."
                                    : "No groups found. Try another keyword."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {displayedGroups.map((group) => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    onJoin={(id) => void handleJoin(id)}
                                    onLeave={openLeaveConfirmation}
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
                                        {isVietnamese
                                            ? "Không tìm thấy nhóm phù hợp?"
                                            : "Can't find the right group?"}
                                    </h4>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        {isVietnamese
                                            ? "Tạo cộng đồng của riêng bạn và mời bạn bè tham gia!"
                                            : "Create your own community and invite friends to join!"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    {isVietnamese ? "Bắt đầu nhóm mới" : "Start a new group"}
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

            {leaveTargetGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                            {isVietnamese ? "Xác nhận rời nhóm" : "Confirm leaving group"}
                        </h2>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                            {isVietnamese
                                ? `Bạn có chắc muốn rời nhóm "${leaveTargetGroup.name}" không?`
                                : `Are you sure you want to leave "${leaveTargetGroup.name}"?`}
                        </p>
                        {leaveError && (
                            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                                {leaveError}
                            </p>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeLeaveConfirmation}
                                disabled={isLeaving}
                                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                {isVietnamese ? "Hủy" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={() => void confirmLeaveGroup()}
                                disabled={isLeaving}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isLeaving
                                    ? isVietnamese
                                        ? "Đang rời..."
                                        : "Leaving..."
                                    : isVietnamese
                                      ? "Rời nhóm"
                                      : "Leave group"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
