import { Grid3X3, ShoppingBag, Star, Users } from "lucide-react";
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
import { SellerProfileHeader } from "../features/profile/components/SellerProfileHeader";
import type { PublicUserProfile } from "../features/profile/types/profile.types";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { cn } from "../shared/lib/cn";
import { UnifiedHeader } from "../shared/ui";
import { useTranslation } from "react-i18next";

type BuyerVisitorTab = "posts" | "reviews";
type BuyerSelfTab = "posts" | "orders" | "groups" | "reviews";

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthSession();
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [buyerVisitorTab, setBuyerVisitorTab] =
        useState<BuyerVisitorTab>("posts");
    const [buyerSelfTab, setBuyerSelfTab] = useState<BuyerSelfTab>("posts");
    const [suggestedUsers, setSuggestedUsers] = useState<PublicUserProfile[]>(
        [],
    );
    const [suggestedLoading, setSuggestedLoading] = useState(false);
    const { t } = useTranslation();

    const isSelf = !id || id === user?.id;

    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setSuggestedLoading(true);
            try {
                let loadedProfile: PublicUserProfile | null = null;
                if (isSelf && user) {
                    const r = (user as { role?: string }).role?.toLowerCase();
                    loadedProfile = {
                        id: user.id,
                        fullName: user.fullName,
                        avatarUrl: user.avatarUrl,
                        role: r === "seller" ? "seller" : "buyer",
                        followersCount: 0,
                        followingCount: 0,
                        postsCount: 0,
                        isSelf: true,
                    };
                    setProfile(loadedProfile);
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
            p
                ? {
                      ...p,
                      isFollowing: res.following,
                      followersCount: p.followersCount + 1,
                  }
                : p,
        );
    };

    const handleUnfollow = async () => {
        if (!profile) return;
        const res = await profileApi.unfollowUser(profile.id);
        setProfile((p) =>
            p
                ? {
                      ...p,
                      isFollowing: res.following,
                      followersCount: p.followersCount - 1,
                  }
                : p,
        );
    };

    const isSeller = profile?.role === "seller";

    const BUYER_VISITOR_TABS: {
        value: BuyerVisitorTab;
        labelKey: string;
        icon: ReactNode;
    }[] = [
        {
            value: "posts",
            labelKey: "profile.posts",
            icon: <Grid3X3 className="h-4 w-4" />,
        },
        {
            value: "reviews",
            labelKey: "profile.reviews",
            icon: <Star className="h-4 w-4" />,
        },
    ];

    const BUYER_SELF_TABS: {
        value: BuyerSelfTab;
        labelKey: string;
        icon: ReactNode;
    }[] = [
        {
            value: "posts",
            labelKey: "profile.posts",
            icon: <Grid3X3 className="h-4 w-4" />,
        },
        {
            value: "orders",
            labelKey: "profile.orders",
            icon: <ShoppingBag className="h-4 w-4" />,
        },
        { value: "groups", labelKey: "profile.groups", icon: <Users className="h-4 w-4" /> },
        {
            value: "reviews",
            labelKey: "profile.reviews",
            icon: <Star className="h-4 w-4" />,
        },
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
                    <div className="flex flex-col gap-6">
                        <SellerProfileHeader
                            profile={profile}
                            isSelf={isSelf}
                            onFollow={() => void handleFollow()}
                            onUnfollow={() => void handleUnfollow()}
                        />

                        {isSelf ? (
                            <>
                                <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 dark:border-primary-900/50 dark:bg-primary-950/25">
                                    <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-300">
                                        {t("profile.sellerDesc")}
                                    </p>
                                    <Link
                                        to="/seller/dashboard"
                                        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/25 transition-opacity hover:opacity-90"
                                    >
                                        {t("profile.openSellerDashboard")}
                                    </Link>
                                </div>
                                <ProfilePostsGrid
                                    posts={posts}
                                    isLoading={isLoading}
                                    columns={3}
                                />
                            </>
                        ) : (
                            <ProfilePostsGrid
                                posts={posts}
                                isLoading={isLoading}
                                columns={3}
                            />
                        )}
                    </div>
                ) : !isSelf ? (
                    <div className="mx-auto w-full max-w-7xl space-y-6">
                        <BuyerProfileHeader
                            profile={profile}
                            isSelf={false}
                            onFollow={() => void handleFollow()}
                            onUnfollow={() => void handleUnfollow()}
                        />
                        <BuyerProfileSuggestedStrip
                            users={suggestedUsers}
                            loading={suggestedLoading}
                        />
                        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="no-scrollbar flex overflow-x-auto border-b border-neutral-100 px-2 dark:border-neutral-800">
                                {BUYER_VISITOR_TABS.map((tab) => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() =>
                                            setBuyerVisitorTab(tab.value)
                                        }
                                        className={cn(
                                            "flex min-w-[100px] flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
                                            buyerVisitorTab === tab.value
                                                ? "border-b-2 border-primary font-bold text-primary"
                                                : "font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200",
                                        )}
                                    >
                                        {tab.icon}
                                        {t(tab.labelKey)}
                                    </button>
                                ))}
                            </div>
                            <div className="p-6">
                                {buyerVisitorTab === "posts" ? (
                                    <BuyerProfilePostGrid
                                        posts={posts}
                                        isLoading={isLoading}
                                    />
                                ) : (
                                    <div className="py-8 text-center text-neutral-400">
                                        {t("profile.noReviews")}
                                    </div>
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
                                                onClick={() =>
                                                    setBuyerSelfTab(tab.value)
                                                }
                                                className={cn(
                                                    "flex min-w-[100px] flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
                                                    buyerSelfTab === tab.value
                                                        ? "border-b-2 border-primary font-bold text-primary"
                                                        : "font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200",
                                                )}
                                            >
                                                {tab.icon}
                                                {t(tab.labelKey)}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-6">
                                        {buyerSelfTab === "posts" ? (
                                            <BuyerProfilePostGrid
                                                posts={posts}
                                                isLoading={isLoading}
                                            />
                                        ) : buyerSelfTab === "orders" ? (
                                            <div className="space-y-4 py-4 text-center">
                                                <p className="text-neutral-600 dark:text-neutral-300">
                                                    {t("profile.ordersDesc")}
                                                </p>
                                                <Link
                                                    to="/orders"
                                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-700"
                                                >
                                                    {t("profile.goToOrders")}
                                                </Link>
                                            </div>
                                        ) : buyerSelfTab === "groups" ? (
                                            <div className="space-y-4 py-4 text-center">
                                                <p className="text-neutral-600 dark:text-neutral-300">
                                                    {t("profile.groupsDesc")}
                                                </p>
                                                <Link
                                                    to="/groups"
                                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-700"
                                                >
                                                    {t("profile.goToGroups")}
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-neutral-400">
                                                {t("profile.noReviews")}
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
