import {
    Bell,
    Globe,
    LogOut,
    Menu,
    MessageCircle,
    Monitor,
    Search,
    ShoppingCart,
    User,
    X,
} from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { MessageDropdown } from "../../../../features/messaging/components/MessageDropdown";
import { useMessagingOptional } from "../../../../features/messaging/context/MessagingContext";
import { NotificationDropdown } from "../../../../features/notification/components/NotificationDropdown";
import { NotificationToastStack } from "../../../../features/notification/components/NotificationToastStack";
import { useNotificationCenter } from "../../../../features/notification/context/NotificationContext";
import { useAuthSession } from "../../../auth/useAuthSession";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/cn";
import { ThemePickerModal } from "../../molecules/theme-picker-modal/ThemePickerModal";
import { Avatar, Button, Input } from "../../atoms";
import { BrandLogo } from "../brand-logo/BrandLogo";

type HeaderNavItem = {
    label: string;
    to: string;
};

interface UnifiedHeaderProps {
    navItems?: HeaderNavItem[];
    activePath?: string;
    searchValue?: string;
    onSearch?: (value: string) => void;
}

const defaultNavItems: HeaderNavItem[] = [
    { label: "Feed", to: "/feed" },
    { label: "Marketplace", to: "/marketplace" },
];

/** Numeric badge on header icons (caps display at 99+). */
function HeaderCountBadge({ count }: { count: number }) {
    if (count < 1) return null;
    const label = count > 99 ? "99+" : String(count);
    return (
        <span
            className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground"
            aria-hidden
        >
            {label}
        </span>
    );
}

export function UnifiedHeader({
    navItems = defaultNavItems,
    activePath,
    searchValue,
    onSearch,
}: UnifiedHeaderProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [themeModalOpen, setThemeModalOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [messagesOpen, setMessagesOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const messageRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, logout } = useAuthSession();
    const { t, i18n } = useTranslation();
    const {
        notifications,
        unreadCount,
        liveToasts,
        dismissToast,
        markRead,
        markAllRead,
    } = useNotificationCenter();
    const messaging = useMessagingOptional();
    const unreadChatsCount = messaging?.unreadChatsCount ?? 0;

    const toggleLanguage = () => {
        const newLang = i18n.language === "vi" ? "en" : "vi";
        void i18n.changeLanguage(newLang);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const t = e.target as Node;
            if (notifRef.current && !notifRef.current.contains(t)) {
                setNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(t)) {
                setProfileOpen(false);
            }
            if (messageRef.current && !messageRef.current.contains(t)) {
                setMessagesOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        void (async () => {
            setLoggingOut(true);
            setProfileOpen(false);
            try {
                await logout();
                navigate("/login");
            } finally {
                setLoggingOut(false);
            }
        })();
    };

    const openThemeModal = () => {
        setProfileOpen(false);
        setThemeModalOpen(true);
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-background-dark/90">
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
                                        : "text-neutral-500 hover:text-primary",
                                )}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="hidden flex-1 px-2 md:block">
                    <div className="relative mx-auto max-w-2xl">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            className="h-10 pl-9"
                            placeholder={t("header.searchPlaceholder")}
                            {...(searchValue !== undefined
                                ? {
                                      value: searchValue,
                                      onChange: (
                                          e: ChangeEvent<HTMLInputElement>,
                                      ) => onSearch?.(e.target.value),
                                  }
                                : {
                                      onChange: (
                                          e: ChangeEvent<HTMLInputElement>,
                                      ) => onSearch?.(e.target.value),
                                  })}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <div ref={notifRef} className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-neutral-600 dark:text-neutral-300"
                            onClick={() => {
                                setNotifOpen((v) => !v);
                                setMessagesOpen(false);
                            }}
                            aria-label={
                                unreadCount > 0
                                    ? t("header.notificationsBadgeAria", { count: unreadCount })
                                    : t("header.notifications")
                            }
                        >
                            <Bell className="h-5 w-5" />
                            <HeaderCountBadge count={unreadCount} />
                        </Button>
                        {notifOpen && (
                            <NotificationDropdown
                                notifications={notifications}
                                unreadCount={unreadCount}
                                onClose={() => setNotifOpen(false)}
                                onMarkAllRead={() => void markAllRead()}
                            />
                        )}
                    </div>
                    <div ref={messageRef} className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-neutral-600 dark:text-neutral-300"
                            onClick={() => {
                                setMessagesOpen((v) => !v);
                                setNotifOpen(false);
                            }}
                            aria-expanded={messagesOpen}
                            aria-haspopup="dialog"
                            aria-label={
                                unreadChatsCount > 0
                                    ? t("header.messagesBadgeAria", { count: unreadChatsCount })
                                    : t("header.messages")
                            }
                        >
                            <MessageCircle className="h-5 w-5" />
                            <HeaderCountBadge count={unreadChatsCount} />
                        </Button>
                        {messagesOpen && messaging ? (
                            <MessageDropdown onClose={() => setMessagesOpen(false)} />
                        ) : null}
                    </div>
                    <Link to="/cart">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-neutral-600 dark:text-neutral-300"
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </Button>
                    </Link>

                    {user ? (
                        <div ref={profileRef} className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setProfileOpen((v) => !v)}
                                className="rounded-full ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                aria-expanded={profileOpen}
                                aria-haspopup="menu"
                            >
                                <Avatar
                                    wrapperClassName=""
                                    src={user.avatarUrl}
                                    alt={user.fullName ?? "User avatar"}
                                />
                            </button>
                            {profileOpen ? (
                                <div
                                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                                    role="menu"
                                >
                                    <Link
                                        to="/profile"
                                        role="menuitem"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        <User className="h-4 w-4 shrink-0 text-neutral-500" />
                                        {t("header.profileSettings")}
                                    </Link>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                        onClick={openThemeModal}
                                    >
                                        <Monitor className="h-4 w-4 shrink-0 text-neutral-500" />
                                        {t("theme.title")}
                                    </button>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                        onClick={() => {
                                            toggleLanguage();
                                            setProfileOpen(false);
                                        }}
                                    >
                                        <Globe className="h-4 w-4 shrink-0 text-neutral-500" />
                                        {t("header.language", "Language")} &middot; <span className="ml-1 font-semibold uppercase">{i18n.language}</span>
                                    </button>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        disabled={loggingOut}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-4 w-4 shrink-0 text-neutral-500" />
                                        {loggingOut
                                            ? t("header.loggingOut")
                                            : t("header.logout")}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <Link to="/profile" className="shrink-0">
                            <Avatar wrapperClassName="" alt="User avatar" />
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-label="Toggle navigation"
                    >
                        {mobileOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
                </div>

                {mobileOpen ? (
                    <div className="space-y-3 border-t border-neutral-200 px-4 py-4 dark:border-neutral-800 md:hidden">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            className="h-10 pl-9"
                            placeholder={t("header.searchPlaceholder")}
                            {...(searchValue !== undefined
                                ? {
                                      value: searchValue,
                                      onChange: (
                                          e: ChangeEvent<HTMLInputElement>,
                                      ) => onSearch?.(e.target.value),
                                  }
                                : {
                                      onChange: (
                                          e: ChangeEvent<HTMLInputElement>,
                                      ) => onSearch?.(e.target.value),
                                  })}
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
                                        : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                                )}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                    {user ? (
                        <div className="border-t border-neutral-200 pt-3 dark:border-neutral-800">
                            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                {t("header.profileSettings")}
                            </p>
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                onClick={() => setMobileOpen(false)}
                            >
                                <User className="h-4 w-4" />
                                {t("header.profileSettings")}
                            </Link>
                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                onClick={() => {
                                    setMobileOpen(false);
                                    setThemeModalOpen(true);
                                }}
                            >
                                <Monitor className="h-4 w-4" />
                                {t("theme.title")}
                            </button>
                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                onClick={() => {
                                    setMobileOpen(false);
                                    toggleLanguage();
                                }}
                            >
                                <Globe className="h-4 w-4" />
                                {t("header.language", "Language")} &middot; <span className="ml-1 font-semibold uppercase">{i18n.language}</span>
                            </button>
                            <button
                                type="button"
                                disabled={loggingOut}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                onClick={() => {
                                    setMobileOpen(false);
                                    handleLogout();
                                }}
                            >
                                <LogOut className="h-4 w-4" />
                                {t("header.logout")}
                            </button>
                        </div>
                    ) : null}
                    </div>
                ) : null}

                {themeModalOpen ? (
                    <ThemePickerModal onClose={() => setThemeModalOpen(false)} />
                ) : null}
            </header>
            <NotificationToastStack
                items={liveToasts}
                onDismiss={dismissToast}
                onOpen={(id) => void markRead(id)}
            />
        </>
    );
}
