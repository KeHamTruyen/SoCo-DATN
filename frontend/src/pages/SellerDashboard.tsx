import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
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
import { SellerProfileHeader } from "../features/profile/components/SellerProfileHeader";
import type {
    PublicUserProfile,
    SellerStats,
} from "../features/profile/types/profile.types";
import { useAuthSession } from "../shared/auth/useAuthSession";
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

    const productListParams = useMemo(() => {
        if (!isSeller || (tab !== "shop" && tab !== "inventory")) return null;
        if (tab === "shop") {
            return {
                page: 1,
                limit: 100,
                ...(shopStatusFilter ? { status: shopStatusFilter } : {}),
            };
        }
        return { page: 1, limit: 100 };
    }, [isSeller, tab, shopStatusFilter]);

    const reloadProducts = useCallback(() => {
        setProductsReloadKey((k) => k + 1);
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
    }, [isSeller, tab]);

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
                        { label: "Feed", to: "/feed" },
                        { label: "Marketplace", to: "/marketplace" },
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
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
            />

            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex min-w-0 flex-col gap-6">
                    <SellerProfileHeader
                        profile={profile}
                        isSelf
                        onFollow={() => {}}
                        onUnfollow={() => {}}
                    />

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
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
