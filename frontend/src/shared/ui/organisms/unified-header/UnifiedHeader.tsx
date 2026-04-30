import {
    Bell,
    Globe,
    LogOut,
    Menu,
    MessageCircle,
    Monitor,
    Search,
    Settings,
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
import { getSearchHistory, saveSearchTerm } from "../../../lib/searchHistory";
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
    onSearchSubmit?: (value: string) => void;
    onSearchFocus?: () => void;
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
    onSearchSubmit,
    onSearchFocus,
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
    const desktopSearchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, logout } = useAuthSession();
    const { t, i18n } = useTranslation();

    const translatedNavItems = navItems.map((item) => ({
        ...item,
        label:
            item.to === "/feed"
                ? t("header.feed")
                : item.to === "/marketplace"
                ? t("header.marketplace")
                : item.label,
    }));

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
    const [internalSearch, setInternalSearch] = useState(searchValue ?? "");
    const [searchHistoryOpen, setSearchHistoryOpen] = useState(false);
    const [historyItems, setHistoryItems] = useState<string[]>([]);
    const [visibleHistoryCount, setVisibleHistoryCount] = useState(7);

    useEffect(() => {
        if (searchValue !== undefined) {
            setInternalSearch(searchValue);
        }
    }, [searchValue]);

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
            const outsideDesktop = !desktopSearchRef.current?.contains(t);
            const outsideMobile = !mobileSearchRef.current?.contains(t);
            if (outsideDesktop && outsideMobile) {
                setSearchHistoryOpen(false);
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

    const handleSearchChange = (value: string) => {
        if (searchValue === undefined) {
            setInternalSearch(value);
        }
        onSearch?.(value);
    };

    const openSearchHistory = () => {
        setHistoryItems(getSearchHistory());
        setVisibleHistoryCount(7);
        setSearchHistoryOpen(true);
        onSearchFocus?.();
    };

    const submitSearch = (rawValue: string) => {
        const value = rawValue.trim();
        if (!value) return;
        const nextHistory = saveSearchTerm(value);
        setHistoryItems(nextHistory);
        if (onSearchSubmit) onSearchSubmit(value);
        else navigate(`/search?q=${encodeURIComponent(value)}`);
        setSearchHistoryOpen(false);
        setMobileOpen(false);
    };

    const currentSearchValue = searchValue !== undefined ? searchValue : internalSearch;
    const visibleHistory = historyItems.slice(0, visibleHistoryCount);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-background-dark/90">
                <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
                <div className="flex items-center gap-4 lg:gap-8">
                    <BrandLogo className="[&>span]:hidden sm:[&>span]:inline" />
                    <nav className="hidden items-center gap-6 md:flex">
                        {translatedNavItems.map((item) => (
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
                    <div ref={desktopSearchRef} className="relative mx-auto max-w-2xl">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            className="h-10 pl-9"
                            placeholder={t("header.searchPlaceholder")}
                            value={currentSearchValue}
                            onFocus={openSearchHistory}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleSearchChange(e.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    submitSearch(currentSearchValue);
                                }
                            }}
                        />
                        {searchHistoryOpen ? (
                            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-60 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                    {t("header.recentSearches")}
                                </p>
                                {visibleHistory.length > 0 ? (
                                    <div className="space-y-1">
                                        {visibleHistory.map((term) => (
                                            <button
                                                key={term}
                                                type="button"
                                                className="w-full rounded-lg px-2 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                                onClick={() => {
                                                    handleSearchChange(term);
                                                    submitSearch(term);
                                                }}
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="px-2 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        {t("header.noRecentSearches")}
                                    </p>
                                )}
                                {historyItems.length > visibleHistoryCount ? (
                                    <button
                                        type="button"
                                        className="mt-1 w-full rounded-lg px-2 py-2 text-left text-sm font-semibold text-primary hover:bg-primary/10"
                                        onClick={() => setVisibleHistoryCount((prev) => prev + 5)}
                                    >
                                        {t("header.loadMoreSearches")}
                                    </button>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    {user ? (
                        <>
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
                        </>
                    ) : null}

                    {user ? (
                        <div ref={profileRef} className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setProfileOpen((v) => !v)}
                                className="rounded-full ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                aria-haspopup="menu"
                                aria-label={t("header.openAccountMenu")}
                                title={t("header.openAccountMenu")}
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
                                        {t("header.profile")}
                                    </Link>
                                    <Link
                                        to="/settings"
                                        role="menuitem"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        <Settings className="h-4 w-4 shrink-0 text-neutral-500" />
                                        {t("header.settings")}
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
                                        {t("header.language")} &middot; <span className="ml-1 font-semibold uppercase">{i18n.language}</span>
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
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="shrink-0">
                                <Button size="sm" variant="outline">
                                    {t("header.login")}
                                </Button>
                            </Link>
                            <Link to="/signup" className="shrink-0">
                                <Button size="sm">{t("header.register")}</Button>
                            </Link>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-label={t("header.toggleNavigation")}
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
                    <div ref={mobileSearchRef} className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            className="h-10 pl-9"
                            placeholder={t("header.searchPlaceholder")}
                            value={currentSearchValue}
                            onFocus={openSearchHistory}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleSearchChange(e.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    submitSearch(currentSearchValue);
                                }
                            }}
                        />
                        {searchHistoryOpen ? (
                            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-60 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                    {t("header.recentSearches")}
                                </p>
                                {visibleHistory.length > 0 ? (
                                    <div className="space-y-1">
                                        {visibleHistory.map((term) => (
                                            <button
                                                key={`m-${term}`}
                                                type="button"
                                                className="w-full rounded-lg px-2 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                                onClick={() => {
                                                    handleSearchChange(term);
                                                    submitSearch(term);
                                                }}
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="px-2 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        {t("header.noRecentSearches")}
                                    </p>
                                )}
                                {historyItems.length > visibleHistoryCount ? (
                                    <button
                                        type="button"
                                        className="mt-1 w-full rounded-lg px-2 py-2 text-left text-sm font-semibold text-primary hover:bg-primary/10"
                                        onClick={() => setVisibleHistoryCount((prev) => prev + 5)}
                                    >
                                        {t("header.loadMoreSearches")}
                                    </button>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                    <nav className="flex flex-col gap-1">
                        {translatedNavItems.map((item) => (
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
                                {t("header.account")}
                            </p>
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                onClick={() => setMobileOpen(false)}
                            >
                                <User className="h-4 w-4" />
                                {t("header.profile")}
                            </Link>
                            <Link
                                to="/settings"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                onClick={() => setMobileOpen(false)}
                            >
                                <Settings className="h-4 w-4" />
                                {t("header.settings")}
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
                                {t("header.language")} &middot; <span className="ml-1 font-semibold uppercase">{i18n.language}</span>
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
                    ) : (
                        <div className="border-t border-neutral-200 pt-3 dark:border-neutral-800">
                            <div className="flex gap-2">
                                <Link
                                    to="/login"
                                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {t("header.login")}
                                </Link>
                                <Link
                                    to="/signup"
                                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary/90"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {t("header.register")}
                                </Link>
                            </div>
                        </div>
                    )}
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
