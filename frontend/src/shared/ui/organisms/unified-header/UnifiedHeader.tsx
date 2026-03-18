import {
    Bell,
    Menu,
    MessageCircle,
    Search,
    ShoppingCart,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { notificationApi } from "../../../../features/notification/api/notificationApi";
import { NotificationDropdown } from "../../../../features/notification/components/NotificationDropdown";
import type { Notification } from "../../../../features/notification/types/notification.types";
import { useAuthSession } from "../../../auth/useAuthSession";
import { Avatar, Button, Input } from "../../atoms";
import { BrandLogo } from "../brand-logo/BrandLogo";
import { cn } from "../../../lib/cn";

type HeaderNavItem = {
    label: string;
    to: string;
};

interface UnifiedHeaderProps {
    navItems?: HeaderNavItem[];
    activePath?: string;
    onSearch?: (value: string) => void;
}

const defaultNavItems: HeaderNavItem[] = [
    { label: "Feed", to: "/feed" },
    { label: "Marketplace", to: "/marketplace" },
];

export function UnifiedHeader({
    navItems = defaultNavItems,
    activePath,
    onSearch,
}: UnifiedHeaderProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthSession();

    useEffect(() => {
        void notificationApi
            .listNotifications()
            .then((data) => {
                setNotifications(data.items.slice(0, 5));
                setUnreadCount(data.unreadCount);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/90">
            <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
                <div className="flex items-center gap-4 lg:gap-8">
                    <BrandLogo className="[&>span]:hidden sm:[&>span]:inline" />
                    <nav className="hidden items-center gap-6 md:flex">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.to}
                                className={cn(
                                    "py-5 text-sm font-medium transition-colors",
                                    (activePath ?? item.to) === item.to
                                        ? "border-b-2 border-primary font-bold text-primary"
                                        : "text-slate-500 hover:text-primary",
                                )}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="hidden flex-1 px-2 md:block">
                    <div className="relative mx-auto max-w-2xl">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            className="h-10 pl-9"
                            placeholder="Search products, sellers, or hashtags..."
                            onChange={(e) => onSearch?.(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <div ref={notifRef} className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-slate-600 dark:text-slate-300"
                            onClick={() => setNotifOpen((v) => !v)}
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                        {notifOpen && (
                            <NotificationDropdown
                                notifications={notifications}
                                unreadCount={unreadCount}
                                onClose={() => setNotifOpen(false)}
                            />
                        )}
                    </div>
                    <Link to="/messages">
                        <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
                            <MessageCircle className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/cart">
                        <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
                            <ShoppingCart className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/profile" className="hidden sm:block">
                        <Avatar
                            wrapperClassName=""
                            src={
                                user?.avatarUrl ??
                                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
                            }
                            alt={user?.fullName ?? "User avatar"}
                        />
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-label="Toggle navigation"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {mobileOpen ? (
                <div className="space-y-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 md:hidden">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            className="h-10 pl-9"
                            placeholder="Search..."
                            onChange={(e) => onSearch?.(e.target.value)}
                        />
                    </div>
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={`mobile-${item.label}`}
                                to={item.to}
                                className={cn(
                                    "rounded-lg px-3 py-2 text-sm font-medium",
                                    (activePath ?? item.to) === item.to
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                                )}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            ) : null}
        </header>
    );
}
