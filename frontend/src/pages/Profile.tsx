import {
    CalendarClock,
    Grid3X3,
    LayoutDashboard,
    Package,
    Rocket,
    ShoppingBag,
    Sparkles,
    Star,
    Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { feedApi } from "../features/feed/api/feedApi";
import type { FeedPost } from "../features/feed/types/feed.types";
import { profileApi } from "../features/profile/api/profileApi";
import { BuyerProfileHeader } from "../features/profile/components/BuyerProfileHeader";
import { BuyerProfilePostGrid } from "../features/profile/components/BuyerProfilePostGrid";
import { BuyerProfileSelfSidebar } from "../features/profile/components/BuyerProfileSelfSidebar";
import { BuyerProfileSuggestedStrip } from "../features/profile/components/BuyerProfileSuggestedStrip";
import { ProfilePostsGrid } from "../features/profile/components/ProfilePostsGrid";
import { SellerDashboardStats } from "../features/profile/components/SellerDashboardStats";
import { SellerProfileHeader } from "../features/profile/components/SellerProfileHeader";
import type { PublicUserProfile, SellerStats } from "../features/profile/types/profile.types";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { cn } from "../shared/lib/cn";
import { UnifiedHeader } from "../shared/ui";

type SellerTab = "dashboard" | "shop" | "orders" | "feedback";
type BuyerVisitorTab = "posts" | "reviews";
type BuyerSelfTab = "posts" | "orders" | "groups" | "reviews";

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthSession();
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sellerTab, setSellerTab] = useState<SellerTab>("dashboard");
    const [buyerVisitorTab, setBuyerVisitorTab] = useState<BuyerVisitorTab>("posts");
    const [buyerSelfTab, setBuyerSelfTab] = useState<BuyerSelfTab>("posts");
    const [suggestedUsers, setSuggestedUsers] = useState<PublicUserProfile[]>([]);
    const [suggestedLoading, setSuggestedLoading] = useState(false);

    const isSelf = !id || id === user?.id;

    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setSuggestedLoading(true);
            try {
                let loadedProfile: PublicUserProfile | null = null;
                if (isSelf && user) {
                    loadedProfile = {
                        id: user.id,
                        fullName: user.fullName,
                        avatarUrl: user.avatarUrl,
                        role: (user as { role?: "buyer" | "seller" }).role ?? "buyer",
                        followersCount: 0,
                        followingCount: 0,
                        postsCount: 0,
                        isSelf: true,
                    };
                    setProfile(loadedProfile);
                    if ((user as { role?: string }).role === "seller") {
                        const s = await profileApi.getSellerStats();
                        if (!mounted) return;
                        setStats(s);
                    }
                } else if (id) {
                    const p = await profileApi.getProfile(id);
                    if (!mounted) return;
                    loadedProfile = p;
                    setProfile(p);
                }
                const postsData = await feedApi.listPosts();
                if (!mounted) return;
                setPosts(postsData.items.slice(0, 9));

                if (loadedProfile?.role === "buyer") {
                    try {
                        const su = await profileApi.listSuggestedUsers();
                        if (mounted) setSuggestedUsers(su);
                    } catch {
                        if (mounted) setSuggestedUsers([]);
                    }
                } else if (mounted) {
                    setSuggestedUsers([]);
                }
            } catch {
                // silently degrade
            } finally {
                if (mounted) {
                    setIsLoading(false);
                    setSuggestedLoading(false);
                }
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id, isSelf, user]);

    const handleFollow = async () => {
        if (!profile) return;
        const res = await profileApi.followUser(profile.id);
        setProfile((p) =>
            p ? { ...p, isFollowing: res.following, followersCount: p.followersCount + 1 } : p,
        );
    };

    const handleUnfollow = async () => {
        if (!profile) return;
        const res = await profileApi.unfollowUser(profile.id);
        setProfile((p) =>
            p ? { ...p, isFollowing: res.following, followersCount: p.followersCount - 1 } : p,
        );
    };

    const isSeller = profile?.role === "seller";

    const SELLER_TABS: { value: SellerTab; label: string }[] = [
        { value: "dashboard", label: "Dashboard" },
        { value: "shop", label: "My Shop" },
        { value: "orders", label: "Customer Orders" },
        { value: "feedback", label: "Customer Feedback" },
    ];

    const BUYER_VISITOR_TABS: { value: BuyerVisitorTab; label: string; icon: ReactNode }[] = [
        { value: "posts", label: "Bài viết", icon: <Grid3X3 className="h-4 w-4" /> },
        { value: "reviews", label: "Đánh giá", icon: <Star className="h-4 w-4" /> },
    ];

    const BUYER_SELF_TABS: { value: BuyerSelfTab; label: string; icon: ReactNode }[] = [
        { value: "posts", label: "Bài viết", icon: <Grid3X3 className="h-4 w-4" /> },
        { value: "orders", label: "Đơn hàng", icon: <ShoppingBag className="h-4 w-4" /> },
        { value: "groups", label: "Nhóm", icon: <Users className="h-4 w-4" /> },
        { value: "reviews", label: "Đánh giá", icon: <Star className="h-4 w-4" /> },
    ];

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
            />
            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="h-32 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                        <div className="h-48 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                ) : !profile ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                        Profile not found.
                    </div>
                ) : isSeller ? (
                    <div className="flex flex-col gap-6 lg:flex-row">
                        {isSelf && (
                            <aside className="w-full shrink-0 space-y-4 lg:w-56">
                                <nav className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                    <Link
                                        to="/feed"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-600 transition-colors hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span className="text-sm">Home Feed</span>
                                    </Link>
                                    <Link
                                        to="/scheduled-posts"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-600 transition-colors hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        <CalendarClock className="h-4 w-4" />
                                        <span className="text-sm">Scheduled Posts</span>
                                    </Link>
                                    <Link
                                        to="/orders"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-600 transition-colors hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        <Package className="h-4 w-4" />
                                        <span className="text-sm">Inventory</span>
                                    </Link>
                                </nav>

                                <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-700 p-5 text-white shadow-lg shadow-primary/20">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Sparkles className="h-5 w-5" />
                                        <h3 className="font-bold">AI Creative Studio</h3>
                                    </div>
                                    <p className="mb-4 text-xs text-white/80">
                                        Create viral content and schedule posts with one click.
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 py-2 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/30"
                                        >
                                            <Rocket className="h-3.5 w-3.5" />
                                            Generate AI Ad
                                        </button>
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-bold text-primary transition-all"
                                        >
                                            <CalendarClock className="h-3.5 w-3.5" />
                                            Schedule Sale
                                        </button>
                                    </div>
                                </div>
                            </aside>
                        )}

                        <div className="flex flex-1 flex-col gap-6">
                            <SellerProfileHeader
                                profile={profile}
                                isSelf={isSelf}
                                onFollow={() => void handleFollow()}
                                onUnfollow={() => void handleUnfollow()}
                            />

                            {isSelf ? (
                                <>
                                    <div className="no-scrollbar flex gap-8 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
                                        {SELLER_TABS.map((tab) => (
                                            <button
                                                key={tab.value}
                                                type="button"
                                                onClick={() => setSellerTab(tab.value)}
                                                className={cn(
                                                    "whitespace-nowrap border-b-2 pb-4 text-sm font-medium transition-colors",
                                                    sellerTab === tab.value
                                                        ? "border-primary font-bold text-primary"
                                                        : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300",
                                                )}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {sellerTab === "dashboard" && stats && (
                                        <SellerDashboardStats stats={stats} />
                                    )}
                                    {sellerTab === "shop" && (
                                        <ProfilePostsGrid posts={posts} isLoading={isLoading} columns={3} />
                                    )}
                                    {(sellerTab === "orders" || sellerTab === "feedback") && (
                                        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
                                            No data yet.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <ProfilePostsGrid posts={posts} isLoading={isLoading} columns={3} />
                            )}
                        </div>
                    </div>
                ) : !isSelf ? (
                    <div className="mx-auto w-full max-w-7xl space-y-6">
                        <BuyerProfileHeader
                            profile={profile}
                            isSelf={false}
                            onFollow={() => void handleFollow()}
                            onUnfollow={() => void handleUnfollow()}
                        />
                        <BuyerProfileSuggestedStrip users={suggestedUsers} loading={suggestedLoading} />
                        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="no-scrollbar flex overflow-x-auto border-b border-neutral-100 px-2 dark:border-neutral-800">
                                {BUYER_VISITOR_TABS.map((tab) => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => setBuyerVisitorTab(tab.value)}
                                        className={cn(
                                            "flex min-w-[100px] flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
                                            buyerVisitorTab === tab.value
                                                ? "border-b-2 border-primary font-bold text-primary"
                                                : "font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200",
                                        )}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="p-6">
                                {buyerVisitorTab === "posts" ? (
                                    <BuyerProfilePostGrid posts={posts} isLoading={isLoading} />
                                ) : (
                                    <div className="py-8 text-center text-neutral-400">Chưa có đánh giá.</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto w-full max-w-7xl space-y-6">
                        <BuyerProfileHeader
                            profile={profile}
                            isSelf
                            onFollow={() => void handleFollow()}
                            onUnfollow={() => void handleUnfollow()}
                        />
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            <aside className="order-2 lg:order-1 lg:col-span-4">
                                <BuyerProfileSelfSidebar
                                    suggestedUsers={suggestedUsers}
                                    suggestedLoading={suggestedLoading}
                                />
                            </aside>
                            <div className="order-1 lg:order-2 lg:col-span-8">
                                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                    <div className="no-scrollbar flex overflow-x-auto border-b border-neutral-100 px-2 dark:border-neutral-800">
                                        {BUYER_SELF_TABS.map((tab) => (
                                            <button
                                                key={tab.value}
                                                type="button"
                                                onClick={() => setBuyerSelfTab(tab.value)}
                                                className={cn(
                                                    "flex min-w-[100px] flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
                                                    buyerSelfTab === tab.value
                                                        ? "border-b-2 border-primary font-bold text-primary"
                                                        : "font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200",
                                                )}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-6">
                                        {buyerSelfTab === "posts" ? (
                                            <BuyerProfilePostGrid posts={posts} isLoading={isLoading} />
                                        ) : buyerSelfTab === "orders" ? (
                                            <div className="space-y-4 py-4 text-center">
                                                <p className="text-neutral-600 dark:text-neutral-300">
                                                    Xem và quản lý đơn hàng của bạn.
                                                </p>
                                                <Link
                                                    to="/orders"
                                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-700"
                                                >
                                                    Đến trang đơn hàng
                                                </Link>
                                            </div>
                                        ) : buyerSelfTab === "groups" ? (
                                            <div className="space-y-4 py-4 text-center">
                                                <p className="text-neutral-600 dark:text-neutral-300">
                                                    Khám phá và tham gia các nhóm.
                                                </p>
                                                <Link
                                                    to="/groups"
                                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-700"
                                                >
                                                    Đến trang nhóm
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-neutral-400">
                                                Chưa có đánh giá.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
