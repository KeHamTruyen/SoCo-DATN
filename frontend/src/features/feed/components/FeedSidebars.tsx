import {
    Bookmark,
    Calendar,
    Home,
    LayoutDashboard,
    Package,
    ShoppingCart,
    Sparkles,
    Star,
    Store,
    User,
    Users,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { marketplaceApi } from "../../marketplace/api/marketplaceApi";
import type { ProductListItem } from "../../marketplace/types/marketplace.types";
import { orderApi } from "../../order/api/orderApi";
import type { Order } from "../../order/types/order.types";
import { profileApi } from "../../profile/api/profileApi";
import type { PublicUserProfile } from "../../profile/types/profile.types";

// ─── Left Sidebar ────────────────────────────────────────────────────────────

interface NavItemProps {
    to?: string;
    onClick?: () => void;
    icon: ReactNode;
    label: string;
    active?: boolean;
}

function SideNavItem({ to, onClick, icon, label, active }: NavItemProps) {
    const base =
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all";
    const activeClass = "bg-primary/10 text-primary font-semibold";
    const inactiveClass =
        "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800";

    const content = (
        <>
            {icon}
            {label}
        </>
    );

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={`${base} ${active ? activeClass : inactiveClass}`}>
                {content}
            </button>
        );
    }

    return (
        <Link to={to ?? "#"} className={`${base} ${active ? activeClass : inactiveClass}`}>
            {content}
        </Link>
    );
}

export function LeftSidebar({ isSeller }: { isSeller: boolean }) {
    const { pathname } = useLocation();

    return (
        <aside className="custom-scrollbar sticky top-24 hidden h-[calc(100vh-6rem)] w-64 shrink-0 space-y-6 overflow-y-auto pr-2 lg:block">
            <nav className="space-y-1">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Navigation
                </p>
                <SideNavItem
                    to="/feed"
                    icon={<Home className="h-5 w-5" />}
                    label="Home Feed"
                    active={pathname === "/feed"}
                />
                <SideNavItem
                    to="/marketplace"
                    icon={<Store className="h-5 w-5" />}
                    label="Explore Products"
                    active={pathname === "/marketplace"}
                />
                <SideNavItem
                    to="/groups"
                    icon={<Users className="h-5 w-5" />}
                    label="Groups"
                    active={pathname.startsWith("/groups")}
                />
            </nav>

            <nav className="space-y-1">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Personal
                </p>
                <SideNavItem
                    to="/profile"
                    icon={<User className="h-5 w-5" />}
                    label="My Profile"
                    active={pathname === "/profile"}
                />
                <SideNavItem
                    to="/saved-items"
                    icon={<Bookmark className="h-5 w-5" />}
                    label="Saved Items"
                    active={pathname === "/saved-items"}
                />
            </nav>

            <nav className="space-y-1">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Creative Hub
                </p>
                <SideNavItem
                    to="/ai-creative-lab"
                    icon={<Sparkles className="h-5 w-5 text-primary" />}
                    label="AI Creative Lab"
                    active={pathname === "/ai-creative-lab"}
                />
                <SideNavItem
                    to="/scheduled-posts"
                    icon={<Calendar className="h-5 w-5" />}
                    label="Scheduled Posts"
                    active={pathname === "/scheduled-posts"}
                />
            </nav>

            <nav className="space-y-1">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Business
                </p>
                {isSeller ? (
                    <SideNavItem
                        to="/seller/dashboard"
                        icon={<LayoutDashboard className="h-5 w-5" />}
                        label="Seller Dashboard"
                        active={pathname.startsWith("/seller")}
                    />
                ) : (
                    <Link
                        to="/become-seller"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/10"
                    >
                        <Store className="h-4 w-4" />
                        Become a Seller
                    </Link>
                )}
            </nav>
        </aside>
    );
}

// ─── Right Sidebar ────────────────────────────────────────────────────────────

function ActiveOrdersWidget({ orders, loading }: { orders: Order[]; loading: boolean }) {
    const statusLabel: Record<string, string> = {
        shipping: "In Transit",
        confirmed: "Confirmed",
        pending: "Pending",
    };

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold dark:text-white">
                <Package className="h-5 w-5 text-primary" />
                Active Orders
            </h3>

            {loading ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <ShoppingCart className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        No active deliveries right now.
                    </p>
                    <Link
                        to="/cart"
                        className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700"
                    >
                        Shop Now
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            to={`/orders/${order.id}`}
                            className="block rounded-lg bg-neutral-50 p-3 transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                        >
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold">
                                        {order.items[0]?.productName ?? "Order"}
                                        {order.items.length > 1
                                            ? ` +${order.items.length - 1} more`
                                            : ""}
                                    </p>
                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                        #{order.orderNumber}
                                    </p>
                                </div>
                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-950/60 dark:text-primary-400">
                                    {statusLabel[order.status] ?? order.status}
                                </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
                                <div className="h-full w-3/4 rounded-full bg-primary" />
                            </div>
                            <p className="mt-1.5 text-center text-[10px] text-neutral-500 dark:text-neutral-400">
                                Estimated Arrival: Tomorrow
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function TrendingProductsWidget({
    products,
    loading,
}: {
    products: ProductListItem[];
    loading: boolean;
}) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-sm font-bold dark:text-white">Trending Products</h3>

            {loading ? (
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="aspect-square animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                            <div className="h-3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {products.slice(0, 4).map((product) => (
                        <Link key={product.id} to={`/products/${product.id}`} className="group space-y-2">
                            <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Package className="h-8 w-8 text-neutral-300" />
                                    </div>
                                )}
                            </div>
                            <p className="line-clamp-1 text-[11px] font-bold dark:text-neutral-100">{product.name}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold text-primary">${product.price.toFixed(2)}</p>
                                {product.rating ? (
                                    <span className="flex items-center gap-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                                        <Star className="h-3 w-3 fill-primary-400 text-primary-400" />
                                        {product.rating.toFixed(1)}
                                    </span>
                                ) : null}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Link
                to="/marketplace"
                className="mt-4 block w-full py-2 text-center text-xs font-bold text-neutral-500 transition-colors hover:text-primary dark:text-neutral-400 dark:hover:text-primary"
            >
                See more products
            </Link>
        </div>
    );
}

function PeopleToFollowWidget({
    users,
    loading,
}: {
    users: PublicUserProfile[];
    loading: boolean;
}) {
    const [followed, setFollowed] = useState<Set<string>>(new Set());

    const handleFollow = (userId: string) => {
        setFollowed((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
                void profileApi.unfollowUser(userId);
            } else {
                next.add(userId);
                void profileApi.followUser(userId);
            }
            return next;
        });
    };

    if (!loading && users.length === 0) return null;

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-sm font-bold dark:text-white">People to Follow</h3>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                            <div className="flex-1 space-y-1">
                                <div className="h-3 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                                <div className="h-2 w-16 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                            <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
                                <div className="h-9 w-9 overflow-hidden rounded-full bg-neutral-200">
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <User className="h-4 w-4 text-neutral-400" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold dark:text-neutral-100">
                                        {user.fullName || user.username}
                                    </p>
                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                        {(user.followersCount ?? 0).toLocaleString()} followers
                                    </p>
                                </div>
                            </Link>
                            <button
                                type="button"
                                onClick={() => handleFollow(user.id)}
                                className={`text-xs font-bold transition-colors hover:underline ${
                                    followed.has(user.id) ? "text-neutral-400" : "text-primary"
                                }`}
                            >
                                {followed.has(user.id) ? "Following" : "Follow"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function RightSidebar() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [suggestedUsers, setSuggestedUsers] = useState<PublicUserProfile[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);

    useEffect(() => {
        void (async () => {
            try {
                const res = await orderApi.listOrders({ status: "shipping", pageSize: 3 });
                setOrders(res?.items ?? []);
            } catch {
                setOrders([]);
            } finally {
                setOrdersLoading(false);
            }
        })();

        void (async () => {
            try {
                const res = await marketplaceApi.listProducts({ pageSize: 4 });
                setProducts(res?.items ?? []);
            } catch {
                setProducts([]);
            } finally {
                setProductsLoading(false);
            }
        })();

        void (async () => {
            try {
                const res = await profileApi.listSuggestedUsers();
                setSuggestedUsers(res);
            } catch {
                setSuggestedUsers([]);
            } finally {
                setUsersLoading(false);
            }
        })();
    }, []);

    return (
        <aside className="sticky top-24 hidden h-[calc(100vh-6rem)] w-80 shrink-0 space-y-4 overflow-y-auto xl:block">
            <ActiveOrdersWidget orders={orders ?? []} loading={ordersLoading} />
            <TrendingProductsWidget products={products ?? []} loading={productsLoading} />
            <PeopleToFollowWidget users={suggestedUsers} loading={usersLoading} />
        </aside>
    );
}
