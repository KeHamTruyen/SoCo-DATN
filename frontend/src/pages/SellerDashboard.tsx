import { CalendarClock, Rocket, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { orderApi } from "../features/order/api/orderApi";
import type { Order } from "../features/order/types/order.types";
import { sellerDashboardApi } from "../features/seller-dashboard/api/sellerDashboardApi";
import { SellerDashboardChartsPanel } from "../features/seller-dashboard/components/SellerDashboardChartsPanel";
import { SellerDashboardOrdersPanel } from "../features/seller-dashboard/components/SellerDashboardOrdersPanel";
import { SellerDashboardProductsPanel } from "../features/seller-dashboard/components/SellerDashboardProductsPanel";
import type { SellerProductRow } from "../features/seller-dashboard/types/sellerDashboard.types";
import { profileApi } from "../features/profile/api/profileApi";
import { SellerDashboardStats } from "../features/profile/components/SellerDashboardStats";
import { SellerProfileHeader } from "../features/profile/components/SellerProfileHeader";
import type { PublicUserProfile, SellerStats } from "../features/profile/types/profile.types";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { cn } from "../shared/lib/cn";
import { UnifiedHeader } from "../shared/ui";

const EMPTY_STATS: SellerStats = {
    monthlySales: 0,
    monthlySalesGrowth: 0,
    newOrders: 0,
    pendingOrders: 0,
    productViews: 0,
    productViewsToday: 0,
};

type SellerCenterTab =
    | "dashboard"
    | "shop"
    | "inventory"
    | "orders"
    | "feedback"
    | "finances"
    | "settings";

const TABS: { value: SellerCenterTab; label: string }[] = [
    { value: "dashboard", label: "Dashboard" },
    { value: "shop", label: "My Shop" },
    { value: "inventory", label: "Inventory" },
    { value: "orders", label: "Customer Orders" },
    { value: "feedback", label: "Customer Feedback" },
    { value: "finances", label: "Finances" },
    { value: "settings", label: "Settings" },
];

export default function SellerDashboard() {
    const { user } = useAuthSession();
    const role = (user?.role ?? "").toLowerCase();
    const isSeller = role === "seller";

    const [tab, setTab] = useState<SellerCenterTab>("dashboard");
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [stats, setStats] = useState<SellerStats>(EMPTY_STATS);
    const [products, setProducts] = useState<SellerProductRow[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

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
        if (!isSeller || (tab !== "shop" && tab !== "inventory")) return;
        let mounted = true;
        void (async () => {
            setProductsLoading(true);
            try {
                const res = await sellerDashboardApi.listMyProducts({ page: 1, limit: 50 });
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
    }, [isSeller, tab]);

    useEffect(() => {
        if (!isSeller || tab !== "orders") return;
        let mounted = true;
        void (async () => {
            setOrdersLoading(true);
            try {
                const data = await orderApi.listSellerSales({ page: 1, pageSize: 20 });
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
                <div className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-start">
                    <div className="flex min-w-0 flex-col gap-6">
                        <SellerProfileHeader
                            profile={profile}
                            isSelf
                            onFollow={() => {}}
                            onUnfollow={() => {}}
                        />

                        <div className="no-scrollbar flex gap-6 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
                            {TABS.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setTab(t.value)}
                                    className={cn(
                                        "whitespace-nowrap border-b-2 pb-4 text-sm transition-colors",
                                        tab === t.value
                                            ? "border-primary font-bold text-primary"
                                            : "border-transparent font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300",
                                    )}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {tab === "dashboard" && (
                            <div className="space-y-8">
                                <SellerDashboardStats stats={stats} />
                                <SellerDashboardChartsPanel stats={stats} />
                            </div>
                        )}

                        {tab === "shop" && (
                            <SellerDashboardProductsPanel
                                items={products}
                                loading={productsLoading}
                                variant="shop"
                            />
                        )}

                        {tab === "inventory" && (
                            <SellerDashboardProductsPanel
                                items={products}
                                loading={productsLoading}
                                variant="inventory"
                            />
                        )}

                        {tab === "orders" && (
                            <SellerDashboardOrdersPanel orders={orders} loading={ordersLoading} />
                        )}

                        {tab === "feedback" && (
                            <div className="rounded-xl border border-dashed border-neutral-200 py-14 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                Tổng hợp đánh giá theo shop sẽ hiển thị tại đây khi API danh sách review cho
                                seller sẵn sàng.
                            </div>
                        )}

                        {tab === "finances" && (
                            <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                                <h3 className="text-lg font-bold">Finances</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Doanh thu tháng này (ước tính từ đơn):{" "}
                                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                        {stats.monthlySales.toLocaleString("vi-VN")} đ
                                    </span>
                                </p>
                                <p className="text-xs text-neutral-500">
                                    Báo cáo chi tiết, đối soát và rút tiền có thể bổ sung ở phiên bản sau.
                                </p>
                            </div>
                        )}

                        {tab === "settings" && (
                            <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                                <h3 className="text-lg font-bold">Settings</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Chỉnh sửa thông tin hiển thị công khai (ảnh, bio, cửa hàng) trên trang hồ
                                    sơ.
                                </p>
                                <Link
                                    to="/profile"
                                    className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                                >
                                    Mở My Profile
                                </Link>
                            </div>
                        )}
                    </div>

                    <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
                        <div className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-5 text-white shadow-lg shadow-primary/20">
                            <div className="mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                <h3 className="font-bold">AI Creative Studio</h3>
                            </div>
                            <p className="mb-4 text-xs text-white/80">
                                Gợi ý nội dung và lên lịch bài đăng nhanh hơn.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/ai-creative-lab"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 py-2 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/30"
                                >
                                    <Rocket className="h-3.5 w-3.5" />
                                    AI Creative Lab
                                </Link>
                                <Link
                                    to="/scheduled-posts"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-bold text-primary transition-all"
                                >
                                    <CalendarClock className="h-3.5 w-3.5" />
                                    Scheduled Posts
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                                Lối tắt
                            </p>
                            <ul className="mt-3 space-y-2 text-neutral-600 dark:text-neutral-400">
                                <li>
                                    <Link to="/feed" className="hover:text-primary">
                                        Home Feed
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/profile" className="hover:text-primary">
                                        Shop công khai (Profile)
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/orders" className="hover:text-primary">
                                        Đơn mua (cá nhân)
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
