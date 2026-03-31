import {
    Check,
    ChevronDown,
    Globe,
    Image,
    Link2,
    Lock,
    MessageSquarePlus,
    Plus,
    Settings,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    Tag,
    Users,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { CreatePostPayload, FeedPost } from "../features/feed/types/feed.types";
import { CreatePostModal } from "../features/feed/components/CreatePostModal";
import { FeedPostCard } from "../features/feed/components/FeedPostCard";
import { feedApi } from "../features/feed/api/feedApi";
import { groupApi } from "../features/group/api/groupApi";
import type { Group, GroupInvite, GroupJoinRequest, GroupMemberBrief } from "../features/group/types/group.types";
import { UpdateGroupModal } from "../features/group/components/UpdateGroupModal";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { cn } from "../shared/lib/cn";
import { Avatar, UnifiedHeader } from "../shared/ui";

type GroupTab = "discussion" | "members" | "products" | "media";

const TABS: { value: GroupTab; label: string }[] = [
    { value: "discussion", label: "Discussion" },
    { value: "members", label: "Members" },
    { value: "products", label: "Group Products" },
    { value: "media", label: "Media" },
];

// Seeded gradient backgrounds for groups without covers
const GRADIENT_PAIRS = [
    "from-orange-400 to-rose-500",
    "from-blue-500 to-purple-600",
    "from-emerald-400 to-teal-600",
    "from-pink-400 to-violet-500",
    "from-amber-400 to-orange-600",
    "from-cyan-400 to-blue-600",
    "from-lime-400 to-emerald-600",
    "from-fuchsia-400 to-pink-600",
];

const AVATAR_COLORS = [
    "bg-blue-600",
    "bg-primary",
    "bg-emerald-600",
    "bg-red-600",
    "bg-yellow-600",
    "bg-violet-600",
];

function getGradient(name: string) {
    return GRADIENT_PAIRS[name.charCodeAt(0) % GRADIENT_PAIRS.length];
}

function getAvatarColor(name: string) {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 3);
}

async function copyToClipboard(text: string) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
}

export default function GroupDetail() {
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuthSession();
    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<GroupTab>("discussion");

    // Post state
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);

    // UI state
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [inviteCopied, setInviteCopied] = useState(false);
    const [members, setMembers] = useState<GroupMemberBrief[]>([]);
    const [mediaRows, setMediaRows] = useState<Array<{ id: string; mediaUrls: string[]; mediaType?: string }>>([]);
    const [productRows, setProductRows] = useState<Array<Record<string, unknown>>>([]);
    const [tabLoading, setTabLoading] = useState(false);
    const [joinRequests, setJoinRequests] = useState<GroupJoinRequest[]>([]);
    const [invites, setInvites] = useState<GroupInvite[]>([]);

    // ── Fetch group data ──
    useEffect(() => {
        if (!id) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await groupApi.getGroup(id);
                if (!mounted) return;
                setGroup(data);
            } catch {
                if (!mounted) return;
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    useEffect(() => {
        const inviteCode = searchParams.get("invite");
        if (!id || !inviteCode || group?.isMember) return;
        void (async () => {
            try {
                await groupApi.joinByInvite(inviteCode);
                setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete("invite");
                    return next;
                });
                const data = await groupApi.getGroup(id);
                setGroup(data);
            } catch {
                // ignore invalid invite code
            }
        })();
    }, [group?.isMember, id, searchParams, setSearchParams]);

    // ── Fetch group posts when group is loaded or tab changes ──
    const fetchPosts = useCallback(async () => {
        if (!id || activeTab !== "discussion") return;
        setPostsLoading(true);
        try {
            const res = await groupApi.getGroupPosts(id);
            setPosts(res.items);
        } catch {
            setPosts([]);
        } finally {
            setPostsLoading(false);
        }
    }, [id, activeTab]);

    useEffect(() => {
        void fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        if (!id || activeTab === "discussion") return;
        let mounted = true;
        void (async () => {
            setTabLoading(true);
            try {
                if (activeTab === "members") {
                    const res = await groupApi.getGroupMembers(id);
                    if (mounted) setMembers(res.data ?? []);
                    if (canManageRoles || isModerator) {
                        const requestsRes = await groupApi.listJoinRequests(id);
                        if (mounted) setJoinRequests(requestsRes.data ?? []);
                    }
                    if (canManageRoles) {
                        const invitesRes = await groupApi.listInvites(id);
                        if (mounted) setInvites(invitesRes ?? []);
                    }
                } else if (activeTab === "media") {
                    const res = await groupApi.getGroupMedia(id);
                    if (mounted) setMediaRows(res.data ?? []);
                } else if (activeTab === "products") {
                    const res = await groupApi.getGroupProducts(id);
                    if (mounted) setProductRows(res.data ?? []);
                }
            } catch {
                if (!mounted) return;
                if (activeTab === "members") setMembers([]);
                if (activeTab === "media") setMediaRows([]);
                if (activeTab === "products") setProductRows([]);
            } finally {
                if (mounted) setTabLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [activeTab, id, group?.memberRole]);

    // ── Handlers ──
    const handleToggleMembership = async () => {
        if (!group || !id) return;
        try {
            if (group.isMember) {
                await groupApi.leaveGroup(id);
                setGroup((g) => g ? { ...g, isMember: false, memberRole: null, membersCount: g.membersCount - 1 } : g);
            } else {
                const joined = await groupApi.joinGroup(id);
                if (joined.requested) return;
                setGroup((g) => g ? { ...g, isMember: true, memberRole: "MEMBER", membersCount: g.membersCount + 1 } : g);
            }
        } catch { /* silently ignore */ }
    };

    const handleCreatePost = async (payload: CreatePostPayload) => {
        if (!id) return;
        await groupApi.createGroupPost(id, payload);
        void fetchPosts();
    };

    const handleLike = async (postId: string) => {
        await feedApi.likePost(postId);
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) }
                    : p,
            ),
        );
    };

    const handleComment = async (postId: string, content: string) => {
        await feedApi.addComment(postId, content);
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p,
            ),
        );
    };

    const handleInvite = () => {
        const link = `${window.location.origin}/groups/${id}`;
        void copyToClipboard(link).then(() => {
            setInviteCopied(true);
            setTimeout(() => setInviteCopied(false), 2000);
        });
    };

    const handleGroupUpdated = (updated: Group) => {
        setGroup(updated);
        setShowUpdateModal(false);
    };

    const isPublic = group?.privacy?.toUpperCase() === "PUBLIC";
    const isAdmin = group?.memberRole === "ADMIN";
    const isModerator = group?.memberRole === "MODERATOR";
    const canManageRoles = isAdmin;
    const canRemoveMembers = isAdmin || isModerator;
    const avatarColor = group ? getAvatarColor(group.name) : "bg-primary";
    const gradient = group ? getGradient(group.name) : GRADIENT_PAIRS[0];

    // Admin members from the group.members array
    const adminMembers = group?.members?.filter((m) => m.role === "ADMIN") ?? [];

    const handlePromoteDemote = async (target: GroupMemberBrief, role: "MODERATOR" | "MEMBER") => {
        if (!id || !canManageRoles) return;
        await groupApi.updateMemberRole(id, target.userId, role);
        setMembers((prev) => prev.map((m) => (m.userId === target.userId ? { ...m, role } : m)));
    };

    const handleRemoveMember = async (target: GroupMemberBrief) => {
        if (!id || !canRemoveMembers) return;
        await groupApi.removeMember(id, target.userId);
        setMembers((prev) => prev.filter((m) => m.userId !== target.userId));
    };

    const handleReviewRequest = async (requestId: string, action: "approve" | "reject") => {
        if (!id) return;
        if (action === "approve") await groupApi.approveJoinRequest(id, requestId);
        else await groupApi.rejectJoinRequest(id, requestId);
        setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
    };

    const handleCreateInvite = async () => {
        if (!id || !canManageRoles) return;
        const invite = await groupApi.createInvite(id, { expiresInHours: 72, maxUses: 1 });
        setInvites((prev) => [invite, ...prev]);
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

            {/* ── Loading skeleton ── */}
            {isLoading ? (
                <div className="mx-auto max-w-360 space-y-6 px-4 py-8 sm:px-6">
                    <div className="h-64 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-24 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        <div className="space-y-4 lg:col-span-3">
                            <div className="h-40 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                        <div className="h-48 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                </div>
            ) : !group ? (
                /* ── Not found ── */
                <div className="mx-auto max-w-360 px-4 py-8">
                    <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/40 dark:bg-red-900/20">
                        <XCircle className="h-12 w-12 text-red-400" />
                        <p className="text-red-600 dark:text-red-400">Không tìm thấy nhóm.</p>
                    </div>
                </div>
            ) : (
                /* ── Main content ── */
                <main className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6">
                    {/* ── Group Header Card ── */}
                    <div className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        {/* Cover image */}
                        <div className="relative h-56 w-full sm:h-64">
                            {group.coverImageUrl ? (
                                <img
                                    src={group.coverImageUrl}
                                    alt={group.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className={cn("h-full w-full bg-linear-to-br", gradient)} />
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                        </div>

                        {/* Info + actions */}
                        <div className="px-6 pb-0">
                            <div className="relative z-10 -mt-12 flex flex-col gap-6 md:flex-row md:items-end">
                                {/* Group avatar overlapping cover */}
                                {group.avatarUrl ? (
                                    <img
                                        src={group.avatarUrl}
                                        alt={group.name}
                                        className="h-32 w-32 shrink-0 rounded-xl border-4 border-white object-cover shadow-lg dark:border-neutral-900"
                                    />
                                ) : (
                                    <div
                                        className={cn(
                                            "flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border-4 border-white text-3xl font-bold text-white shadow-lg dark:border-neutral-900",
                                            avatarColor,
                                        )}
                                    >
                                        {getInitials(group.name)}
                                    </div>
                                )}

                                {/* Name + meta + buttons */}
                                <div className="flex flex-1 flex-col gap-1 pb-2 md:flex-row md:items-end md:justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                                            {group.name}
                                        </h1>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                            <span className="flex items-center gap-1">
                                                {isPublic ? (
                                                    <Globe className="h-4 w-4" />
                                                ) : (
                                                    <Lock className="h-4 w-4" />
                                                )}
                                                {isPublic ? "Public Group" : "Private Group"}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                            <span>{group.membersCount.toLocaleString()} Members</span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {group.isMember ? (
                                            <>
                                                <button
                                                    type="button"
                                                    id="group-joined-btn"
                                                    onClick={() => void handleToggleMembership()}
                                                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                                >
                                                    Joined <ChevronDown className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    id="group-invite-btn"
                                                    onClick={handleInvite}
                                                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                                >
                                                    {inviteCopied ? (
                                                        <><Check className="h-4 w-4 text-green-500" /> Copied!</>
                                                    ) : (
                                                        <><Link2 className="h-4 w-4" /> Invite</>
                                                    )}
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        id="group-settings-btn"
                                                        onClick={() => setShowUpdateModal(true)}
                                                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                        Settings
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                id="group-join-btn"
                                                onClick={() => void handleToggleMembership()}
                                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                                            >
                                                <Users className="h-4 w-4" />
                                                Join Group
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="mt-6 flex gap-8 border-t border-neutral-100 pt-1 dark:border-neutral-800">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        id={`group-tab-${tab.value}`}
                                        onClick={() => setActiveTab(tab.value)}
                                        className={cn(
                                            "relative pb-4 text-sm font-semibold transition-colors",
                                            activeTab === tab.value
                                                ? "text-primary"
                                                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
                                        )}
                                    >
                                        {tab.label}
                                        {activeTab === tab.value && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── 2-column layout ── */}
                    <div className="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-4">
                        {/* ── Main column (3/4) ── */}
                        <div className="space-y-6 lg:col-span-3">
                            {activeTab === "discussion" && (
                                <>
                                    {/* Create Post Box — opens CreatePostModal */}
                                    {group.isMember && (
                                        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                            <div className="flex gap-3">
                                                <Avatar
                                                    src={user?.avatarUrl}
                                                    alt={user?.fullName ?? "You"}
                                                    wrapperClassName="h-10 w-10 shrink-0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPostModal(true)}
                                                    className="flex-1 rounded-xl bg-neutral-100 px-4 py-2.5 text-left text-sm text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                                >
                                                    Share something with the group...
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPostModal(true)}
                                                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                    >
                                                        <Image className="h-4 w-4 text-primary" />
                                                        Photo/Video
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPostModal(true)}
                                                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                    >
                                                        <Tag className="h-4 w-4 text-primary" />
                                                        Tag Product
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPostModal(true)}
                                                    className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary transition-all hover:bg-primary/20"
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                    AI Assistant
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Post Feed */}
                                    {postsLoading ? (
                                        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                            Loading posts...
                                        </div>
                                    ) : posts.length > 0 ? (
                                        posts.map((post) => (
                                            <FeedPostCard
                                                key={post.id}
                                                post={{
                                                    ...post,
                                                    // Inside group detail, don't show group badge overlay
                                                    group: undefined,
                                                }}
                                                onLike={() => void handleLike(post.id)}
                                                onComment={(content) => handleComment(post.id, content)}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                                <MessageSquarePlus className="h-7 w-7 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                                                    Chưa có bài viết nào.
                                                </p>
                                                <p className="mt-1 text-sm text-neutral-400">
                                                    Hãy là người đầu tiên chia sẻ điều gì đó với nhóm!
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === "members" && (
                                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                    {tabLoading ? <p className="text-sm text-neutral-500">Loading members...</p> : (
                                        <div className="space-y-3">
                                            {members.map((m) => (
                                                <div key={m.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 dark:border-neutral-800">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar src={m.user.avatarUrl} alt={m.user.fullName ?? m.user.username ?? "Member"} wrapperClassName="h-9 w-9" />
                                                        <div>
                                                            <p className="text-sm font-semibold">{m.user.fullName ?? m.user.username ?? "Member"}</p>
                                                            <p className="text-xs text-neutral-500">{m.role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {canManageRoles && m.role !== "ADMIN" && (
                                                            <button type="button" onClick={() => void handlePromoteDemote(m, m.role === "MODERATOR" ? "MEMBER" : "MODERATOR")} className="rounded-md border px-2 py-1 text-xs">
                                                                {m.role === "MODERATOR" ? "Demote" : "Promote"}
                                                            </button>
                                                        )}
                                                        {canRemoveMembers && m.role !== "ADMIN" && (
                                                            <button type="button" onClick={() => void handleRemoveMember(m)} className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-500">
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {!members.length && <p className="text-sm text-neutral-500">No members found.</p>}
                                        </div>
                                    )}
                                    {(canManageRoles || isModerator) && (
                                        <div className="mt-5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                            <p className="mb-2 text-sm font-semibold">Pending Requests</p>
                                            <div className="space-y-2">
                                                {joinRequests.map((r) => (
                                                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-2 dark:border-neutral-800">
                                                        <span className="text-sm">{r.user.fullName ?? r.user.username ?? "User"}</span>
                                                        <div className="flex gap-2">
                                                            <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => void handleReviewRequest(r.id, "approve")}>Approve</button>
                                                            <button type="button" className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-500" onClick={() => void handleReviewRequest(r.id, "reject")}>Reject</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {!joinRequests.length && <p className="text-xs text-neutral-500">No pending requests.</p>}
                                            </div>
                                        </div>
                                    )}
                                    {canManageRoles && (
                                        <div className="mt-5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-sm font-semibold">Invites</p>
                                                <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => void handleCreateInvite()}>
                                                    Create invite
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {invites.map((invite) => (
                                                    <div key={invite.id} className="flex items-center justify-between rounded-md border border-neutral-100 p-2 text-xs dark:border-neutral-800">
                                                        <span>{invite.code}</span>
                                                        <button type="button" onClick={() => void copyToClipboard(`${window.location.origin}/groups/${id}?invite=${invite.code}`)} className="rounded border px-2 py-1">
                                                            Copy
                                                        </button>
                                                    </div>
                                                ))}
                                                {!invites.length && <p className="text-xs text-neutral-500">No active invites.</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "media" && (
                                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                    {tabLoading ? <p className="text-sm text-neutral-500">Loading media...</p> : (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {mediaRows.flatMap((row) => row.mediaUrls.map((url) => (
                                                <img key={`${row.id}-${url}`} src={url} alt="group media" className="h-32 w-full rounded-lg object-cover" />
                                            )))}
                                            {!mediaRows.length && <p className="col-span-full text-sm text-neutral-500">No media yet.</p>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "products" && (
                                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                    {tabLoading ? <p className="text-sm text-neutral-500">Loading products...</p> : (
                                        <div className="space-y-2">
                                            {productRows.map((row) => (
                                                <div key={String(row.id)} className="rounded-lg border border-neutral-100 p-3 dark:border-neutral-800">
                                                    <p className="text-sm font-semibold">{String(row.title ?? "Product")}</p>
                                                    <p className="text-xs text-neutral-500">{String(row.price ?? "")}</p>
                                                </div>
                                            ))}
                                            {!productRows.length && <p className="text-sm text-neutral-500">No tagged products.</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Sidebar (1/4) ── */}
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
                                    View All Products
                                </button>
                            </div>

                            {/* Join CTA */}
                            {!group.isMember && (
                                <div
                                    className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-neutral-300 p-6 text-center transition-all hover:border-primary/40 hover:bg-primary/5 dark:border-neutral-700"
                                    onClick={() => void handleToggleMembership()}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Plus className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                                        Join to post in this group
                                    </p>
                                    <button
                                        type="button"
                                        className="text-sm font-bold text-primary hover:underline"
                                    >
                                        Join Group
                                    </button>
                                </div>
                            )}
                        </aside>
                    </div>
                </main>
            )}

            {/* ── CreatePostModal ── */}
            {showPostModal && id && (
                <CreatePostModal
                    onClose={() => setShowPostModal(false)}
                    onCreate={handleCreatePost}
                    groupId={id}
                />
            )}

            {/* ── UpdateGroupModal ── */}
            {showUpdateModal && group && id && (
                <UpdateGroupModal
                    group={group}
                    onClose={() => setShowUpdateModal(false)}
                    onUpdated={handleGroupUpdated}
                />
            )}
        </div>
    );
}
