import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { orderApi } from "../features/order/api/orderApi";
import type { Order } from "../features/order/types/order.types";
import { sellerDashboardApi } from "../features/seller-dashboard/api/sellerDashboardApi";
import { SellerCreativeStudioBanner } from "../features/seller-dashboard/components/SellerCreativeStudioBanner";
import { SellerDashboardTabBar } from "../features/seller-dashboard/components/SellerDashboardTabBar";
import { SellerDashboardTabPanels } from "../features/seller-dashboard/components/SellerDashboardTabPanels";
import type {
    SellerProductRow,
    SellerShopStatusFilter,
} from "../features/seller-dashboard/types/sellerDashboard.types";
import {
    parseSellerCenterTab,
    type SellerCenterTab,
} from "../features/seller-dashboard/sellerDashboardTabs";
import { profileApi } from "../features/profile/api/profileApi";
import type {
    PublicUserProfile,
    SellerStats,
} from "../features/profile/types/profile.types";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { Avatar } from "../shared/ui/atoms/avatar";
import { Button } from "../shared/ui/atoms/button";
import { UnifiedHeader } from "../shared/ui";

const EMPTY_STATS: SellerStats = {
    monthlySales: 0,
    monthlySalesGrowth: 0,
    newOrders: 0,
    pendingOrders: 0,
    productViews: 0,
    productViewsToday: 0,
};

export default function SellerDashboard() {
    const { t } = useTranslation();
    const { user } = useAuthSession();
    const role = (user?.role ?? "").toLowerCase();
    const isSeller = role === "seller";

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = useMemo(
        () => parseSellerCenterTab(searchParams.get("tab")),
        [searchParams],
    );

    const setTab = useCallback(
        (next: SellerCenterTab) => {
            setSearchParams(
                (prev) => {
                    const p = new URLSearchParams(prev);
                    if (next === "dashboard") {
                        p.delete("tab");
                    } else {
                        p.set("tab", next);
                    }
                    return p;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [stats, setStats] = useState<SellerStats>(EMPTY_STATS);
    const [products, setProducts] = useState<SellerProductRow[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [shopStatusFilter, setShopStatusFilter] =
        useState<SellerShopStatusFilter>("");
    const [productsReloadKey, setProductsReloadKey] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersReloadKey, setOrdersReloadKey] = useState(0);

    const productListParams = useMemo(() => {
        if (!isSeller || (tab !== "shop" && tab !== "inventory")) return null;
        if (tab === "shop") {
            const isDeletedFilter = shopStatusFilter === "DELETED";
            return {
                page: 1,
                limit: 100,
                ...(isDeletedFilter ? { includeDeleted: true } : {}),
                ...(shopStatusFilter
                    ? { status: shopStatusFilter }
                    : {}),
            };
        }
        return { page: 1, limit: 100 };
    }, [isSeller, tab, shopStatusFilter]);

    const reloadProducts = useCallback(() => {
        setProductsReloadKey((k) => k + 1);
    }, []);
    const reloadOrders = useCallback(() => {
        setOrdersReloadKey((k) => k + 1);
    }, []);

    useEffect(() => {
        if (!user?.id || !isSeller) return;
        let mounted = true;
        void (async () => {
            try {
                const p = await profileApi.getProfile(user.id);
                if (!mounted) return;
                setProfile(p);
            } catch {
                if (!mounted) return;
                setProfile({
                    id: user.id,
                    fullName: user.fullName ?? "Seller",
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                    role: "seller",
                    followersCount: 0,
                    followingCount: 0,
                    postsCount: 0,
                    isSelf: true,
                });
            }
        })();
        return () => {
            mounted = false;
        };
    }, [user?.id, user?.fullName, user?.username, user?.avatarUrl, isSeller]);

    useEffect(() => {
        if (!isSeller) return;
        let mounted = true;
        void (async () => {
            try {
                const s = await profileApi.getSellerStats();
                if (!mounted) return;
                setStats(s);
            } catch {
                if (!mounted) return;
                setStats(EMPTY_STATS);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [isSeller]);

    useEffect(() => {
        if (!productListParams) return;
        let mounted = true;
        void (async () => {
            setProductsLoading(true);
            try {
                const res = await sellerDashboardApi.listMyProducts(
                    productListParams,
                );
                if (!mounted) return;
                setProducts(res.items);
            } catch {
                if (!mounted) return;
                setProducts([]);
            } finally {
                if (mounted) setProductsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [productListParams, productsReloadKey]);

    useEffect(() => {
        if (!isSeller || tab !== "orders") return;
        let mounted = true;
        void (async () => {
            setOrdersLoading(true);
            try {
                const data = await orderApi.listSellerSales({
                    page: 1,
                    pageSize: 20,
                });
                if (!mounted) return;
                setOrders(data.items);
            } catch {
                if (!mounted) return;
                setOrders([]);
            } finally {
                if (mounted) setOrdersLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [isSeller, tab, ordersReloadKey]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isSeller) {
        return <Navigate to="/feed" replace />;
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                <UnifiedHeader
                    navItems={[
                        { label: t("messaging.navFeed", "Feed"), to: "/feed" },
                        { label: t("messaging.navMarketplace", "Marketplace"), to: "/marketplace" },
                    ]}
                />
                <div className="mx-auto max-w-7xl px-4 py-16">
                    <div className="h-40 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: t("messaging.navFeed", "Feed"), to: "/feed" },
                    { label: t("messaging.navMarketplace", "Marketplace"), to: "/marketplace" },
                ]}
            />

            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex min-w-0 flex-col gap-6">
                    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={profile.avatarUrl}
                                    alt={profile.shopName ?? profile.fullName ?? "Seller"}
                                    wrapperClassName="h-14 w-14 rounded-full ring-2 ring-primary/20"
                                />
                                <div>
                                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                                        {profile.shopName ?? profile.fullName ?? t("sellerDashboard.page.sellerFallback", "Seller")}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        @{profile.username}
                                    </p>
                                </div>
                            </div>
                            <Link to="/settings">
                                <Button variant="outline">{t("header.settings", "Settings")}</Button>
                            </Link>
                        </div>
                    </section>

                    <SellerCreativeStudioBanner />

                    <SellerDashboardTabBar tab={tab} onTabChange={setTab} />

                    <div
                        role="tabpanel"
                        id="seller-dashboard-tabpanel"
                        aria-labelledby={`seller-tab-${tab}`}
                    >
                        <SellerDashboardTabPanels
                            tab={tab}
                            stats={stats}
                            products={products}
                            productsLoading={productsLoading}
                            orders={orders}
                            ordersLoading={ordersLoading}
                            shopStatusFilter={shopStatusFilter}
                            onShopStatusFilterChange={setShopStatusFilter}
                            onProductsUpdated={reloadProducts}
                            onOrdersUpdated={reloadOrders}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
