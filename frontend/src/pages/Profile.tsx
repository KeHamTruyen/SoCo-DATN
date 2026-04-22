import {
    CalendarClock,
    Grid3X3,
    LayoutDashboard,
    Package,
    Share2,
    ShoppingBag,
    Star,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GuestAuthModal, UnifiedHeader } from "../shared/ui";
import { cn } from "../shared/lib/cn";

// Components
import { BuyerProfileHeader } from "../features/profile/components/BuyerProfileHeader";
import { BuyerProfilePostGrid } from "../features/profile/components/BuyerProfilePostGrid";
import { BuyerProfileSelfSidebar } from "../features/profile/components/BuyerProfileSelfSidebar";
import { BuyerProfileSuggestedStrip } from "../features/profile/components/BuyerProfileSuggestedStrip";
import { ProfilePostsGrid } from "../features/profile/components/ProfilePostsGrid";
import { SellerProfileAboutSidebar } from "../features/profile/components/SellerProfileAboutSidebar";
import { SellerProfileHeader } from "../features/profile/components/SellerProfileHeader";
import { SellerProfileProductGrid } from "../features/profile/components/SellerProfileProductGrid";
import { PostDetailModal } from "../features/feed/components/PostDetailModal";
import { CreatePostModal } from "../features/feed/components/CreatePostModal";

import { ProfileProvider, useProfileContext } from "../features/profile/context/ProfileContext";
import type { ReactNode } from "react";

const tabBarClass = "no-scrollbar flex overflow-x-auto border-b border-border px-2 bg-card";
const tabBtnClass = (active: boolean) =>
    cn(
        "flex min-w-[100px] flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
        active
            ? "border-b-2 border-primary font-bold text-primary"
            : "font-semibold text-muted-foreground hover:text-foreground",
    );

function ProfileContent() {
    const { t } = useTranslation();
    const ctx = useProfileContext();

    const renderBuyerTabs = () => {
        if (!ctx.isSelf) {
            const tabs: { value: string; labelKey: string; icon: ReactNode }[] = [
                { value: "posts", labelKey: "profile.posts", icon: <Grid3X3 className="h-4 w-4" /> },
                { value: "reviews", labelKey: "profile.reviews", icon: <Star className="h-4 w-4" /> },
            ];
            return (
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className={tabBarClass}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => ctx.setBuyerVisitorTab(tab.value as any)}
                                className={tabBtnClass(ctx.buyerVisitorTab === tab.value)}
                            >
                                {tab.icon}
                                {t(tab.labelKey)}
                            </button>
                        ))}
                    </div>
                    <div className="p-6">
                        {ctx.buyerVisitorTab === "posts" ? (
                            <BuyerProfilePostGrid />
                        ) : (
                            <div className="py-8 text-center text-sm text-muted-foreground">{t("profile.noReviews")}</div>
                        )}
                    </div>
                </div>
            );
        }

        const selfTabs = [
            { value: "posts", labelKey: "profile.posts", icon: <Grid3X3 className="h-4 w-4" /> },
            { value: "orders", labelKey: "profile.orders", icon: <ShoppingBag className="h-4 w-4" /> },
            { value: "groups", labelKey: "profile.groups", icon: <Users className="h-4 w-4" /> },
            { value: "reviews", labelKey: "profile.reviews", icon: <Star className="h-4 w-4" /> },
        ];
        return (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className={tabBarClass}>
                    {selfTabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => ctx.setBuyerSelfTab(tab.value as any)}
                            className={tabBtnClass(ctx.buyerSelfTab === tab.value)}
                        >
                            {tab.icon}
                            {t(tab.labelKey)}
                        </button>
                    ))}
                </div>
                <div className="p-6">
                    {ctx.buyerSelfTab === "posts" ? (
                        <BuyerProfilePostGrid />
                    ) : ctx.buyerSelfTab === "orders" ? (
                        <div className="space-y-4 py-4 text-center">
                            <p className="text-muted-foreground">{t("profile.ordersDesc")}</p>
                            <Link to="/orders" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{t("profile.goToOrders")}</Link>
                        </div>
                    ) : ctx.buyerSelfTab === "groups" ? (
                        <div className="space-y-4 py-4 text-center">
                            <p className="text-muted-foreground">{t("profile.groupsDesc")}</p>
                            <Link to="/groups" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{t("profile.goToGroups")}</Link>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">{t("profile.noReviews")}</div>
                    )}
                </div>
            </div>
        );
    };

    const renderSellerTabs = () => {
        if (!ctx.isSelf) {
            const tabs = [
                { value: "products", labelKey: "profile.products", icon: <Package className="h-4 w-4" /> },
                { value: "posts", labelKey: "profile.posts", icon: <Grid3X3 className="h-4 w-4" /> },
                { value: "reviews", labelKey: "profile.reviews", icon: <Star className="h-4 w-4" /> },
            ];

            const productCategories = Array.from(new Set(ctx.shopProducts.map(p => p.category).filter(Boolean))).sort();

            return (
                <>
                    <div className={cn("mb-6 overflow-hidden rounded-2xl border border-border shadow-sm", tabBarClass)}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => ctx.setSellerVisitorTab(tab.value as any)}
                                className={tabBtnClass(ctx.sellerVisitorTab === tab.value)}
                            >
                                {tab.icon}
                                {t(tab.labelKey)}
                            </button>
                        ))}
                    </div>
                    {ctx.sellerVisitorTab === "products" ? (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">{t("profile.categoryLabel")}</span>
                                    <select
                                        value={ctx.productCategory ?? ""}
                                        onChange={(e) => ctx.setProductCategory(e.target.value || null)}
                                        className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                                    >
                                        <option value="">{t("profile.allCategories")}</option>
                                        {productCategories.map((c) => <option key={c as string} value={c as string}>{c as string}</option>)}
                                    </select>
                                </div>
                                <p className="text-sm text-muted-foreground">{t("profile.itemsCount", { count: ctx.shopProducts.length })}</p>
                            </div>
                            <SellerProfileProductGrid />
                        </div>
                    ) : ctx.sellerVisitorTab === "posts" ? (
                        <ProfilePostsGrid />
                    ) : (
                        <div className="py-12 text-center text-sm text-muted-foreground">{t("profile.noReviews")}</div>
                    )}
                </>
            );
        }

        const selfTabs = [
            { value: "posts", labelKey: "profile.posts", icon: <Grid3X3 className="h-4 w-4" /> },
            { value: "shop", labelKey: "profile.shop", icon: <Package className="h-4 w-4" /> },
            { value: "reviews", labelKey: "profile.reviews", icon: <Star className="h-4 w-4" /> },
            { value: "scheduled", labelKey: "profile.scheduled", icon: <CalendarClock className="h-4 w-4" /> },
        ];

        const productCategories = Array.from(new Set(ctx.shopProducts.map(p => p.category).filter(Boolean))).sort();

        return (
            <>
                <div className={cn("mb-6 overflow-hidden rounded-2xl border border-border shadow-sm", tabBarClass)}>
                    {selfTabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => ctx.setSellerSelfTab(tab.value as any)}
                            className={tabBtnClass(ctx.sellerSelfTab === tab.value)}
                        >
                            {tab.icon}
                            {t(tab.labelKey)}
                        </button>
                    ))}
                </div>
                {ctx.sellerSelfTab === "posts" ? (
                    <>
                        <ProfilePostsGrid />
                        {ctx.postsHasMore && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => void ctx.loadMorePosts()}
                                    disabled={ctx.postsLoadingMore}
                                    className="rounded-xl border border-border bg-background px-8 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
                                >
                                    {ctx.postsLoadingMore ? t("profile.loadingMore") : t("profile.loadMorePosts")}
                                </button>
                            </div>
                        )}
                    </>
                ) : ctx.sellerSelfTab === "shop" ? (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">{t("profile.categoryLabel")}</span>
                                <select
                                    value={ctx.productCategory ?? ""}
                                    onChange={(e) => ctx.setProductCategory(e.target.value || null)}
                                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                                >
                                    <option value="">{t("profile.allCategories")}</option>
                                    {productCategories.map((c) => <option key={c as string} value={c as string}>{c as string}</option>)}
                                </select>
                            </div>
                            <Link to="/seller/dashboard" className="text-sm font-semibold text-primary hover:underline">{t("profile.openSellerDashboard")}</Link>
                        </div>
                        <SellerProfileProductGrid />
                    </div>
                ) : ctx.sellerSelfTab === "reviews" ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">{t("profile.noReviews")}</div>
                ) : (
                    <div className="space-y-4 py-8 text-center">
                        <p className="text-muted-foreground">{t("profile.scheduledHint")}</p>
                        <Link to="/scheduled-posts" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-700">{t("profile.goToScheduledPosts")}</Link>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
            <UnifiedHeader navItems={[{ label: "Feed", to: "/feed" }, { label: "Marketplace", to: "/marketplace" }]} />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
                {ctx.isLoading ? (
                    <div className="space-y-6">
                        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
                        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
                    </div>
                ) : !ctx.profile ? (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">{t("profile.notFound")}</div>
                ) : ctx.isSeller ? (
                    <div className="flex flex-col gap-6">
                        <SellerProfileHeader />
                        <div className={cn("grid grid-cols-1 gap-8", ctx.isSelf && "lg:grid-cols-12")}>
                            {ctx.isSelf && (
                                <aside className="space-y-6 lg:col-span-3">
                                    <SellerProfileAboutSidebar profile={ctx.profile} />
                                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                                        <div className="flex flex-col gap-2">
                                            <Link to="/seller/dashboard" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted">
                                                <LayoutDashboard className="h-4 w-4 shrink-0" />
                                                {t("profile.sellerDashboardShort")}
                                            </Link>
                                            <button onClick={() => void ctx.handleShareShop()} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted">
                                                <Share2 className="h-4 w-4 shrink-0" />
                                                {t("profile.shareShop")}
                                            </button>
                                        </div>
                                        {ctx.shopShareNotice && <p className="mt-3 text-center text-xs text-muted-foreground">{ctx.shopShareNotice}</p>}
                                    </div>
                                </aside>
                            )}
                            <div className={cn(ctx.isSelf ? "lg:col-span-9" : "lg:col-span-12")}>
                                {renderSellerTabs()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto w-full max-w-7xl space-y-6">
                        <BuyerProfileHeader />
                        {ctx.isSelf ? (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                                <aside className="order-2 lg:order-1 lg:col-span-4">
                                    <BuyerProfileSelfSidebar suggestedUsers={ctx.suggestedUsers} suggestedLoading={ctx.suggestedLoading} />
                                </aside>
                                <div className="order-1 lg:order-2 lg:col-span-8">
                                    {renderBuyerTabs()}
                                </div>
                            </div>
                        ) : (
                            <>
                                <BuyerProfileSuggestedStrip users={ctx.suggestedUsers} loading={ctx.suggestedLoading} />
                                {renderBuyerTabs()}
                            </>
                        )}
                    </div>
                )}
            </main>

            {ctx.profileModalPost && (
                <PostDetailModal
                    post={ctx.profileModalPost}
                    onClose={() => ctx.setPostDetailModalId(null)}
                    onLike={() => void ctx.handleProfileModalLike(ctx.profileModalPost!.id)}
                    onComment={(c) => void ctx.handleProfileModalComment(ctx.profileModalPost!.id, c)}
                />
            )}
            {ctx.createPostModalOpen && ctx.isSelf && ctx.user && (
                <CreatePostModal
                    onClose={() => ctx.setCreatePostModalOpen(false)}
                    onCreate={(payload) => ctx.handleProfileCreatePost(payload)}
                />
            )}
            <GuestAuthModal
                open={ctx.showGuestAuthModal}
                onClose={() => ctx.setShowGuestAuthModal(false)}
            />
        </div>
    );
}

export default function Profile() {
    return (
        <ProfileProvider>
            <ProfileContent />
        </ProfileProvider>
    );
}
