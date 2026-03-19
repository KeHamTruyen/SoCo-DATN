import {
    CalendarClock,
    Grid3X3,
    LayoutDashboard,
    LogOut,
    Package,
    Rocket,
    Sparkles,
    Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { feedApi } from "../features/feed/api/feedApi";
import type { FeedPost } from "../features/feed/types/feed.types";
import { profileApi } from "../features/profile/api/profileApi";
import { BuyerProfileHeader } from "../features/profile/components/BuyerProfileHeader";
import { ProfilePostsGrid } from "../features/profile/components/ProfilePostsGrid";
import { SellerDashboardStats } from "../features/profile/components/SellerDashboardStats";
import { SellerProfileHeader } from "../features/profile/components/SellerProfileHeader";
import type { PublicUserProfile, SellerStats } from "../features/profile/types/profile.types";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { cn } from "../shared/lib/cn";
import { Button, UnifiedHeader } from "../shared/ui";

type SellerTab = "dashboard" | "shop" | "orders" | "feedback";
type BuyerTab = "posts" | "reviews";

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, logout } = useAuthSession();
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [sellerTab, setSellerTab] = useState<SellerTab>("dashboard");
    const [buyerTab, setBuyerTab] = useState<BuyerTab>("posts");

    const isSelf = !id || id === user?.id;

    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                if (isSelf && user) {
                    setProfile({
                        id: user.id,
                        fullName: user.fullName,
                        avatarUrl: user.avatarUrl,
                        role: (user as { role?: "buyer" | "seller" }).role ?? "buyer",
                        followersCount: 0,
                        followingCount: 0,
                        postsCount: 0,
                        isSelf: true,
                    });
                    if ((user as { role?: string }).role === "seller") {
                        const s = await profileApi.getSellerStats();
                        if (!mounted) return;
                        setStats(s);
                    }
                } else if (id) {
                    const p = await profileApi.getProfile(id);
                    if (!mounted) return;
                    setProfile(p);
                }
                const postsData = await feedApi.listPosts();
                if (!mounted) return;
                setPosts(postsData.items.slice(0, 9));
            } catch {
                // silently degrade
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id, isSelf, user]);

    const handleFollow = async () => {
        if (!profile) return;
        const res = await profileApi.followUser(profile.id);
        setProfile((p) => p ? { ...p, isFollowing: res.following, followersCount: p.followersCount + 1 } : p);
    };

    const handleUnfollow = async () => {
        if (!profile) return;
        const res = await profileApi.unfollowUser(profile.id);
        setProfile((p) => p ? { ...p, isFollowing: res.following, followersCount: p.followersCount - 1 } : p);
    };

    const handleLogout = () => {
        void (async () => {
            setIsLoggingOut(true);
            await logout();
            navigate("/login");
        })();
    };

    const isSeller = profile?.role === "seller";

    const SELLER_TABS: { value: SellerTab; label: string }[] = [
        { value: "dashboard", label: "Dashboard" },
        { value: "shop", label: "My Shop" },
        { value: "orders", label: "Customer Orders" },
        { value: "feedback", label: "Customer Feedback" },
    ];

    const BUYER_TABS: { value: BuyerTab; label: string; icon: React.ReactNode }[] = [
        { value: "posts", label: "Posts", icon: <Grid3X3 className="h-4 w-4" /> },
        { value: "reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
            />
            <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
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
                ) : (
                    <div className="mx-auto max-w-4xl space-y-6">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <BuyerProfileHeader
                                profile={profile}
                                isSelf={isSelf}
                                onFollow={() => void handleFollow()}
                                onUnfollow={() => void handleUnfollow()}
                            />
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="no-scrollbar flex overflow-x-auto border-b border-neutral-100 px-2 dark:border-neutral-800">
                                {BUYER_TABS.map((tab) => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => setBuyerTab(tab.value)}
                                        className={cn(
                                            "flex min-w-[100px] flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
                                            buyerTab === tab.value
                                                ? "border-b-2 border-primary font-bold text-primary"
                                                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200",
                                        )}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="p-6">
                                {buyerTab === "posts" ? (
                                    <ProfilePostsGrid posts={posts} isLoading={isLoading} columns={2} />
                                ) : (
                                    <div className="py-8 text-center text-neutral-400">
                                        No reviews yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {isSelf && (
                            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <h2 className="mb-4 text-lg font-semibold">Account Actions</h2>
                                <Button
                                    variant="outline"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {isLoggingOut ? "Logging out..." : "Logout"}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
