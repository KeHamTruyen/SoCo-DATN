import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

const nav = [
    { to: "/", label: "Dashboard", icon: "dashboard" },
    { to: "/reports", label: "Reported Content", icon: "flag" },
    { to: "/users", label: "User Management", icon: "group" },
    { to: "/content", label: "Content", icon: "article" },
    { to: "/sellers", label: "Seller applications", icon: "storefront" },
    { to: "/settings", label: "Settings", icon: "settings" },
];

export function AdminShell() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
                <div className="flex items-center gap-3 p-6">
                    <div className="flex items-center justify-center rounded-lg bg-sidebar-primary p-2 text-sidebar-primary-foreground">
                        <span className="material-symbols-outlined text-[22px]">
                            shopping_bag
                        </span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">
                            ADMIN PANEL
                        </h1>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                            Social Commerce
                        </p>
                    </div>
                </div>
                <nav className="flex-1 space-y-1 px-4">
                    {nav.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                [
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                                ].join(" ")
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {item.icon}
                            </span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="border-t border-sidebar-border p-4">
                    <div className="flex items-center gap-3 rounded-lg px-2 py-3">
                        <div className="size-8 overflow-hidden rounded-full bg-muted">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">
                                {user?.fullName || user?.username || "Admin"}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                                Administrator
                            </p>
                        </div>
                        <button
                            type="button"
                            className="material-symbols-outlined text-sm text-muted-foreground hover:text-foreground"
                            title="Log out"
                            onClick={() => {
                                logout();
                                navigate("/login", { replace: true });
                            }}
                        >
                            logout
                        </button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}
