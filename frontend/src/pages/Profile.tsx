import { CalendarClock, Grid3X3, Package, ShoppingBag, Star, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { feedApi } from "../features/feed/api/feedApi";
import { PostDetailModal } from "../features/feed/components/PostDetailModal";
import type { FeedComment, FeedPost } from "../features/feed/types/feed.types";
import { marketplaceApi } from "../features/marketplace/api/marketplaceApi";
import { uploadApi } from "../features/upload/api/uploadApi";
import type { ProductListItem } from "../features/marketplace/types/marketplace.types";
import { profileApi } from "../features/profile/api/profileApi";
import { AccountSettingsModal } from "../features/profile/components/AccountSettingsModal";
import type { AccountSettingsTab } from "../features/profile/components/AccountSettingsPanel";
import { BuyerProfileHeader } from "../features/profile/components/BuyerProfileHeader";
import { BuyerProfilePostGrid } from "../features/profile/components/BuyerProfilePostGrid";
import { BuyerProfileSelfSidebar } from "../features/profile/components/BuyerProfileSelfSidebar";
import { BuyerProfileSuggestedStrip } from "../features/profile/components/BuyerProfileSuggestedStrip";
import { ProfilePostsGrid } from "../features/profile/components/ProfilePostsGrid";
import { SellerProfileAboutSidebar } from "../features/profile/components/SellerProfileAboutSidebar";
import { SellerProfileHeader } from "../features/profile/components/SellerProfileHeader";
import { SellerProfileProductGrid } from "../features/profile/components/SellerProfileProductGrid";
import type { PublicUserProfile } from "../features/profile/types/profile.types";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { cn } from "../shared/lib/cn";
import { UnifiedHeader } from "../shared/ui";
import { useTranslation } from "react-i18next";

const POST_PAGE_SIZE = 12;

type BuyerVisitorTab = "posts" | "reviews";
type BuyerSelfTab = "posts" | "orders" | "groups" | "reviews";
type SellerVisitorTab = "products" | "posts" | "reviews";
type SellerSelfTab = "posts" | "shop" | "reviews" | "scheduled";

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const { user, refreshProfile } = useAuthSession();
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [postsPage, setPostsPage] = useState(1);
    const [postsHasMore, setPostsHasMore] = useState(false);
    const [postsLoadingMore, setPostsLoadingMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [buyerVisitorTab, setBuyerVisitorTab] = useState<BuyerVisitorTab>("posts");
    const [buyerSelfTab, setBuyerSelfTab] = useState<BuyerSelfTab>("posts");
    const [sellerVisitorTab, setSellerVisitorTab] = useState<SellerVisitorTab>("products");
    const [sellerSelfTab, setSellerSelfTab] = useState<SellerSelfTab>("posts");
    const [suggestedUsers, setSuggestedUsers] = useState<PublicUserProfile[]>([]);
    const [suggestedLoading, setSuggestedLoading] = useState(false);
    const [shopProducts, setShopProducts] = useState<ProductListItem[]>([]);
    const [shopProductsLoading, setShopProductsLoading] = useState(false);
    const [productCategory, setProductCategory] = useState<string | null>(null);
    const [profileMediaBusy, setProfileMediaBusy] = useState(false);
    const [profileMediaError, setProfileMediaError] = useState<string | null>(null);
    const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
    const [accountSettingsTab, setAccountSettingsTab] = useState<AccountSettingsTab>("profile");
    const { t } = useTranslation();

    const openAccountSettings = useCallback((tab: AccountSettingsTab) => {
        setAccountSettingsTab(tab);
        setAccountSettingsOpen(true);
    }, []);

    const handleAccountSettingsProfileSaved = useCallback(async () => {
        if (!user) return;
        try {
            const p = await profileApi.getProfile(user.id);
            setProfile(p);
        } catch {
            /* keep existing profile */
        }
    }, [user]);

    const [postDetailModalId, setPostDetailModalId] = useState<string | null>(null);

    const profileModalPost = useMemo(
        () =>
            postDetailModalId ? posts.find((p) => p.id === postDetailModalId) ?? null : null,
        [postDetailModalId, posts],
    );

    const openProfilePostModal = useCallback((post: FeedPost) => {
        setPostDetailModalId(post.id);
    }, []);

    useEffect(() => {
        setPostDetailModalId(null);
    }, [id]);

    const handleProfileModalLike = useCallback(async () => {
        if (!postDetailModalId) return;
        const postId = postDetailModalId;
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                          ...post,
                          likedByMe: !post.likedByMe,
                          likesCount: post.likedByMe
                              ? Math.max(0, post.likesCount - 1)
                              : post.likesCount + 1,
                      }
                    : post,
            ),
        );
        try {
            const updated = await feedApi.likePost(postId);
            setPosts((prev) =>
                prev.map((post) => (post.id === postId ? { ...post, ...updated } : post)),
            );
        } catch {
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              likedByMe: !post.likedByMe,
                              likesCount: post.likedByMe
                                  ? post.likesCount + 1
                                  : Math.max(0, post.likesCount - 1),
                          }
                        : post,
                ),
            );
        }
    }, [postDetailModalId]);

    const handleProfileModalComment = useCallback(
        async (content: string) => {
            if (!postDetailModalId) return;
            const postId = postDetailModalId;
            const optimistic: FeedComment = {
                id: `temp-${Date.now()}`,
                content,
                createdAt: new Date().toISOString(),
                user: {
                    id: user?.id ?? "me",
                    email: user?.email ?? "me@local",
                    fullName: user?.fullName,
                    username: user?.username,
                    avatarUrl: user?.avatarUrl,
                    role: user?.role,
                },
            };

            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              commentsCount: post.commentsCount + 1,
                              comments: [optimistic, ...(post.comments ?? [])],
                          }
                        : post,
                ),
            );

            try {
                const created = await feedApi.addComment(postId, content);
                setPosts((prev) =>
                    prev.map((post) =>
                        post.id === postId
                            ? {
                                  ...post,
                                  comments: (post.comments ?? []).map((comment) =>
                                      comment.id === optimistic.id ? created : comment,
                                  ),
                              }
                            : post,
                    ),
                );
            } catch {
                setPosts((prev) =>
                    prev.map((post) =>
                        post.id === postId
                            ? {
                                  ...post,
                                  commentsCount: Math.max(0, post.commentsCount - 1),
                                  comments: (post.comments ?? []).filter(
                                      (comment) => comment.id !== optimistic.id,
                                  ),
                              }
                            : post,
                    ),
                );
            }
        },
        [postDetailModalId, user],
    );

    const isSelf = !id || id === user?.id;

    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setSuggestedLoading(true);
            setShopProductsLoading(true);
            setPosts([]);
            setPostsPage(1);
            setPostsHasMore(false);
            setProductCategory(null);
            try {
                let loadedProfile: PublicUserProfile | null = null;
                if (isSelf) {
                    const selfId = user?.id;
                    if (!selfId) {
                        if (mounted) setProfile(null);
                        return;
                    }
                    loadedProfile = await profileApi.getProfile(selfId);
                } else if (id) {
                    loadedProfile = await profileApi.getProfile(id);
                }
                if (!mounted) return;
                setProfile(loadedProfile);
                if (!loadedProfile) return;

                const postsPromise = feedApi.listUserPosts(loadedProfile.id, 1, POST_PAGE_SIZE);
                const suggestedPromise =
                    loadedProfile.role === "buyer"
                        ? profileApi.listSuggestedUsers().catch(() => [] as PublicUserProfile[])
                        : Promise.resolve([] as PublicUserProfile[]);
                const shopPromise =
                    loadedProfile.role === "seller"
                        ? marketplaceApi
                              .listProducts({ sellerId: loadedProfile.id, pageSize: 48 })
                              .catch(() => ({ items: [] as ProductListItem[] }))
                        : Promise.resolve({ items: [] as ProductListItem[] });

                const [postsData, su, shopData] = await Promise.all([
                    postsPromise,
                    suggestedPromise,
                    shopPromise,
                ]);
                if (!mounted) return;
                setPosts(postsData.items);
                setPostsHasMore(Boolean(postsData.nextCursor));
                setPostsPage(1);
                setSuggestedUsers(su);
                setShopProducts(shopData.items);
            } catch {
                if (mounted) setProfile(null);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                    setSuggestedLoading(false);
                    setShopProductsLoading(false);
                }
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id, isSelf, user?.id, user?.role]);

    const loadMorePosts = useCallback(async () => {
        if (!profile || !postsHasMore || postsLoadingMore) return;
        setPostsLoadingMore(true);
        try {
            const nextPage = postsPage + 1;
            const res = await feedApi.listUserPosts(profile.id, nextPage, POST_PAGE_SIZE);
            setPosts((prev) => [...prev, ...res.items]);
            setPostsPage(nextPage);
            setPostsHasMore(Boolean(res.nextCursor));
        } catch {
            setPostsHasMore(false);
        } finally {
            setPostsLoadingMore(false);
        }
    }, [profile, postsHasMore, postsLoadingMore, postsPage]);

    const productCategories = useMemo(() => {
        const s = new Set<string>();
        for (const p of shopProducts) {
            if (p.category) s.add(p.category);
        }
        return Array.from(s).sort();
    }, [shopProducts]);

    const totalSoldAggregate = useMemo(
        () => shopProducts.reduce((acc, p) => acc + (p.soldCount ?? 0), 0),
        [shopProducts],
    );

    const handleFollow = async () => {
        if (!profile) return;
        const res = await profileApi.followUser(profile.id);
        setProfile((p) => {
            if (!p) return p;
            const wasFollowing = Boolean(p.isFollowing);
            const nowFollowing = Boolean(res.following);
            let followersCount = p.followersCount ?? 0;
            if (nowFollowing && !wasFollowing) followersCount += 1;
            if (!nowFollowing && wasFollowing) followersCount = Math.max(0, followersCount - 1);
            return { ...p, isFollowing: res.following, followersCount };
        });
    };

    const handleUnfollow = async () => {
        if (!profile) return;
        const res = await profileApi.unfollowUser(profile.id);
        setProfile((p) => {
            if (!p) return p;
            const wasFollowing = Boolean(p.isFollowing);
            const nowFollowing = Boolean(res.following);
            let followersCount = p.followersCount ?? 0;
            if (nowFollowing && !wasFollowing) followersCount += 1;
            if (!nowFollowing && wasFollowing) followersCount = Math.max(0, followersCount - 1);
            return { ...p, isFollowing: res.following, followersCount };
        });
    };

    const handleAvatarFile = useCallback(
        async (file: File) => {
            if (!profile) return;
            setProfileMediaError(null);
            setProfileMediaBusy(true);
            try {
                const { url } = await uploadApi.uploadAvatar(file);
                await profileApi.updateProfile({ avatarUrl: url });
                await refreshProfile();
                setProfile((p) => (p ? { ...p, avatarUrl: url } : p));
            } catch (e) {
                setProfileMediaError(
                    e instanceof Error ? e.message : t("profile.uploadError"),
                );
            } finally {
                setProfileMediaBusy(false);
            }
        },
        [profile, refreshProfile, t],
    );

    const handleCoverFile = useCallback(
        async (file: File) => {
            if (!profile) return;
            setProfileMediaError(null);
            setProfileMediaBusy(true);
            try {
                const { url } = await uploadApi.uploadPostMedia(file);
                await profileApi.updateProfile({ coverImage: url });
                await refreshProfile();
                setProfile((p) => (p ? { ...p, coverImage: url, coverUrl: url } : p));
            } catch (e) {
                setProfileMediaError(
                    e instanceof Error ? e.message : t("profile.uploadError"),
                );
            } finally {
                setProfileMediaBusy(false);
            }
        },
        [profile, refreshProfile, t],
    );

    const isSeller = profile?.role === "seller";

    const BUYER_VISITOR_TABS: {
        value: BuyerVisitorTab;
        labelKey: string;
        icon: ReactNode;
    }[] = [
        { value: "posts", labelKey: "profile.posts", icon: <Grid3X3 className="h-4 w-4" /> },
        { value: "reviews", labelKey: "profile.reviews", icon: <Star className="h-4 w-4" /> },
    ];

    const BUYER_SELF_TABS: {
        value: BuyerSelfTab;
        labelKey: string;
        icon: ReactNode;
    }[] = [
        { value: "posts", labelKey: "profile.posts", icon: <Grid3X3 className="h-4 w-4" /> },
        { value: "orders", labelKey: "profile.orders", icon: <ShoppingBag className="h-4 w-4" /> },
        { value: "groups", labelKey: "profile.groups", icon: <Users className="h-4 w-4" /> },
        { value: "reviews", labelKey: "profile.reviews", icon: <Star className="h-4 w-4" /> },
    ];

    const SELLER_VISITOR_TABS: {
        value: SellerVisitorTab;
        labelKey: string;
        icon: ReactNode;
    }[] = [
        { value: "products", labelKey: "profile.products", icon: <Package className="h-4 w-4" /> },
        { value: "posts", labelKey: "profile.posts", icon: <Grid3X3 className="h-4 w-4" /> },
        { value: "reviews", labelKey: "profile.reviews", icon: <Star className="h-4 w-4" /> },
    ];

    const SELLER_SELF_TABS: {
        value: SellerSelfTab;
        labelKey: string;
        icon: ReactNode;
    }[] = [
        { value: "posts", labelKey: "profile.posts", icon: <Grid3X3 className="h-4 w-4" /> },
        { value: "shop", labelKey: "profile.shop", icon: <Package className="h-4 w-4" /> },
        { value: "reviews", labelKey: "profile.reviews", icon: <Star className="h-4 w-4" /> },
        { value: "scheduled", labelKey: "profile.scheduled", icon: <CalendarClock className="h-4 w-4" /> },
    ];

    const tabBarClass =
        "no-scrollbar flex overflow-x-auto border-b border-border px-2 bg-card";

    const tabBtnClass = (active: boolean) =>
        cn(
            "flex min-w-[100px] flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
            active
                ? "border-b-2 border-primary font-bold text-primary"
                : "font-semibold text-muted-foreground hover:text-foreground",
        );

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
            />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
                        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
                    </div>
                ) : !profile ? (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
                        {t("profile.notFound")}
                    </div>
                ) : isSeller ? (
                    <div className="flex flex-col gap-6">
                        <SellerProfileHeader
                            profile={profile}
                            isSelf={isSelf}
                            totalSold={!isSelf ? totalSoldAggregate : undefined}
                            onFollow={() => void handleFollow()}
                            onUnfollow={() => void handleUnfollow()}
                            onAvatarFile={isSelf ? handleAvatarFile : undefined}
                            onCoverFile={isSelf ? handleCoverFile : undefined}
                            profileMediaBusy={profileMediaBusy}
                            profileMediaError={profileMediaError}
                            onOpenEditProfile={
                                isSelf ? () => openAccountSettings("profile") : undefined
                            }
                            onOpenPrivacy={isSelf ? () => openAccountSettings("privacy") : undefined}
                        />

                        <div
                            className={cn(
                                "grid grid-cols-1 gap-8",
                                isSelf ? "lg:grid-cols-12" : "",
                            )}
                        >
                            {isSelf ? (
                                <aside className="space-y-6 lg:col-span-3">
                                    <SellerProfileAboutSidebar profile={profile} />
                                </aside>
                            ) : null}

                            <div className={cn(isSelf ? "lg:col-span-9" : "lg:col-span-12")}>
                                {!isSelf ? (
                                    <>
                                        <div className={cn("mb-6 overflow-hidden rounded-2xl border border-border shadow-sm", tabBarClass)}>
                                            {SELLER_VISITOR_TABS.map((tab) => (
                                                <button
                                                    key={tab.value}
                                                    type="button"
                                                    onClick={() => setSellerVisitorTab(tab.value)}
                                                    className={tabBtnClass(sellerVisitorTab === tab.value)}
                                                >
                                                    {tab.icon}
                                                    {t(tab.labelKey)}
                                                </button>
                                            ))}
                                        </div>
                                        {sellerVisitorTab === "products" ? (
                                            <div className="space-y-6">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {t("profile.categoryLabel")}
                                                        </span>
                                                        <select
                                                            value={productCategory ?? ""}
                                                            onChange={(e) =>
                                                                setProductCategory(
                                                                    e.target.value === ""
                                                                        ? null
                                                                        : e.target.value,
                                                                )
                                                            }
                                                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                                                        >
                                                            <option value="">{t("profile.allCategories")}</option>
                                                            {productCategories.map((c) => (
                                                                <option key={c} value={c}>
                                                                    {c}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {t("profile.itemsCount", { count: shopProducts.length })}
                                                    </p>
                                                </div>
                                                <SellerProfileProductGrid
                                                    products={shopProducts}
                                                    isLoading={shopProductsLoading}
                                                    categoryFilter={productCategory}
                                                />
                                            </div>
                                        ) : sellerVisitorTab === "posts" ? (
                                            <ProfilePostsGrid
                                                posts={posts}
                                                isLoading={false}
                                                columns={3}
                                                onPostClick={openProfilePostModal}
                                            />
                                        ) : (
                                            <div className="py-12 text-center text-sm text-muted-foreground">
                                                {t("profile.noReviews")}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className={cn("mb-6 overflow-hidden rounded-2xl border border-border shadow-sm", tabBarClass)}>
                                            {SELLER_SELF_TABS.map((tab) => (
                                                <button
                                                    key={tab.value}
                                                    type="button"
                                                    onClick={() => setSellerSelfTab(tab.value)}
                                                    className={tabBtnClass(sellerSelfTab === tab.value)}
                                                >
                                                    {tab.icon}
                                                    {t(tab.labelKey)}
                                                </button>
                                            ))}
                                        </div>
                                        {sellerSelfTab === "posts" ? (
                                            <>
                                                <ProfilePostsGrid
                                                    posts={posts}
                                                    isLoading={false}
                                                    columns={2}
                                                    onPostClick={openProfilePostModal}
                                                />
                                                {postsHasMore ? (
                                                    <div className="mt-6 flex justify-center">
                                                        <button
                                                            type="button"
                                                            disabled={postsLoadingMore}
                                                            onClick={() => void loadMorePosts()}
                                                            className="rounded-xl border border-border bg-background px-8 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
                                                        >
                                                            {postsLoadingMore
                                                                ? t("profile.loadingMore")
                                                                : t("profile.loadMorePosts")}
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </>
                                        ) : sellerSelfTab === "shop" ? (
                                            <div className="space-y-6">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {t("profile.categoryLabel")}
                                                        </span>
                                                        <select
                                                            value={productCategory ?? ""}
                                                            onChange={(e) =>
                                                                setProductCategory(
                                                                    e.target.value === ""
                                                                        ? null
                                                                        : e.target.value,
                                                                )
                                                            }
                                                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                                                        >
                                                            <option value="">{t("profile.allCategories")}</option>
                                                            {productCategories.map((c) => (
                                                                <option key={c} value={c}>
                                                                    {c}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <Link
                                                        to="/seller/dashboard"
                                                        className="text-sm font-semibold text-primary hover:underline"
                                                    >
                                                        {t("profile.openSellerDashboard")}
                                                    </Link>
                                                </div>
                                                <SellerProfileProductGrid
                                                    products={shopProducts}
                                                    isLoading={shopProductsLoading}
                                                    categoryFilter={productCategory}
                                                />
                                            </div>
                                        ) : sellerSelfTab === "reviews" ? (
                                            <div className="py-12 text-center text-sm text-muted-foreground">
                                                {t("profile.noReviews")}
                                            </div>
                                        ) : (
                                            <div className="space-y-4 py-8 text-center">
                                                <p className="text-muted-foreground">{t("profile.scheduledHint")}</p>
                                                <Link
                                                    to="/scheduled-posts"
                                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-700"
                                                >
                                                    {t("profile.goToScheduledPosts")}
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
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
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className={tabBarClass}>
                                {BUYER_VISITOR_TABS.map((tab) => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => setBuyerVisitorTab(tab.value)}
                                        className={tabBtnClass(buyerVisitorTab === tab.value)}
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
                                        isLoading={false}
                                        hasMore={postsHasMore}
                                        loadingMore={postsLoadingMore}
                                        onLoadMore={() => void loadMorePosts()}
                                        onPostClick={openProfilePostModal}
                                    />
                                ) : (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
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
                            onAvatarFile={handleAvatarFile}
                            onCoverFile={handleCoverFile}
                            profileMediaBusy={profileMediaBusy}
                            profileMediaError={profileMediaError}
                            onOpenEditProfile={() => openAccountSettings("profile")}
                            onOpenPrivacy={() => openAccountSettings("privacy")}
                        />
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            <aside className="order-2 lg:order-1 lg:col-span-4">
                                <BuyerProfileSelfSidebar
                                    suggestedUsers={suggestedUsers}
                                    suggestedLoading={suggestedLoading}
                                />
                            </aside>
                            <div className="order-1 lg:order-2 lg:col-span-8">
                                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                                    <div className={tabBarClass}>
                                        {BUYER_SELF_TABS.map((tab) => (
                                            <button
                                                key={tab.value}
                                                type="button"
                                                onClick={() => setBuyerSelfTab(tab.value)}
                                                className={tabBtnClass(buyerSelfTab === tab.value)}
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
                                                isLoading={false}
                                                hasMore={postsHasMore}
                                                loadingMore={postsLoadingMore}
                                                onLoadMore={() => void loadMorePosts()}
                                                onPostClick={openProfilePostModal}
                                            />
                                        ) : buyerSelfTab === "orders" ? (
                                            <div className="space-y-4 py-4 text-center">
                                                <p className="text-muted-foreground">{t("profile.ordersDesc")}</p>
                                                <Link
                                                    to="/orders"
                                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-700"
                                                >
                                                    {t("profile.goToOrders")}
                                                </Link>
                                            </div>
                                        ) : buyerSelfTab === "groups" ? (
                                            <div className="space-y-4 py-4 text-center">
                                                <p className="text-muted-foreground">{t("profile.groupsDesc")}</p>
                                                <Link
                                                    to="/groups"
                                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-700"
                                                >
                                                    {t("profile.goToGroups")}
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-sm text-muted-foreground">
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
            <AccountSettingsModal
                open={Boolean(isSelf && user && accountSettingsOpen)}
                onClose={() => setAccountSettingsOpen(false)}
                initialTab={accountSettingsTab}
                onProfileSaveSuccess={handleAccountSettingsProfileSaved}
            />
            {profileModalPost ? (
                <PostDetailModal
                    post={profileModalPost}
                    onClose={() => setPostDetailModalId(null)}
                    onLike={() => void handleProfileModalLike()}
                    onComment={(c) => void handleProfileModalComment(c)}
                />
            ) : null}
        </div>
    );
}
