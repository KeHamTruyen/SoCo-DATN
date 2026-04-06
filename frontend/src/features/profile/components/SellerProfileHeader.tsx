import {
    BadgeCheck,
    Camera,
    CirclePlus,
    Flag,
    MessageCircle,
    MoreHorizontal,
    Pencil,
    Settings,
    Star,
    UserPlus,
    UserCheck,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { Button } from "../../../shared/ui/atoms/button";
import { cn } from "../../../shared/lib/cn";
import type { PublicUserProfile } from "../types/profile.types";
import { useTranslation } from "react-i18next";
import { ReportModal } from "../../report/components/ReportModal";

import { useProfileContext } from "../context/ProfileContext";

export function SellerProfileHeader() {
    const {
        profile,
        isSelf,
        handleFollow,
        handleUnfollow,
        handleAvatarFile,
        handleCoverFile,
        profileMediaBusy,
        profileMediaError,
        setCreatePostModalOpen,
    } = useProfileContext();

    if (!profile) return null;

    const { t } = useTranslation();
    const cover = profile.coverUrl ?? profile.coverImage;
    const displayName = profile.shopName ?? profile.fullName;
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    const handleAvatarInput = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f) void handleAvatarFile(f);
    };

    const handleCoverInput = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f) void handleCoverFile(f);
    };

    useEffect(() => {
        if (!menuOpen) return;
        const onDoc = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, [menuOpen]);

    return (
        <section
            className={cn(
                "overflow-hidden border border-border bg-card shadow-sm",
                isSelf ? "rounded-3xl" : "sm:rounded-2xl",
            )}
        >
            {isSelf ? (
                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverInput}
                />
            ) : null}
            {isSelf ? (
                <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarInput}
                />
            ) : null}

            <div
                className={cn(
                    "relative h-48 w-full md:h-64",
                    !cover &&
                        "bg-linear-to-r from-primary/25 to-primary/5 dark:from-primary/15",
                )}
            >
                {cover ? (
                    <>
                        <img
                            src={cover}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        {isSelf ? (
                            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                        ) : (
                            <div className="absolute inset-0 bg-linear-to-r from-primary/30 to-transparent opacity-70 dark:opacity-50" />
                        )}
                    </>
                ) : null}
                {isSelf ? (
                    <button
                        type="button"
                        disabled={profileMediaBusy}
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 text-sm text-white backdrop-blur-sm transition-all hover:bg-black/60 disabled:opacity-50"
                    >
                        <Camera className="h-4 w-4" />
                        <span className="hidden sm:inline">
                            {t("profile.changeCover")}
                        </span>
                    </button>
                ) : null}
            </div>

            <div className="relative px-4 pb-6 pt-2 sm:px-6">
                {profileMediaError ? (
                    <p className="mb-2 text-sm text-destructive">
                        {profileMediaError}
                    </p>
                ) : null}
                <div
                    className={cn(
                        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
                        isSelf
                            ? "-mt-12 md:-mt-16"
                            : "-mt-10 sm:-mt-12 md:-mt-16",
                    )}
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div
                            className={cn(
                                "group relative shrink-0 overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg",
                                isSelf
                                    ? "h-28 w-28 md:h-32 md:w-32"
                                    : "h-28 w-28 md:h-32 md:w-32",
                                isSelf && "cursor-pointer",
                            )}
                            onClick={() => {
                                if (
                                    isSelf &&
                                    !profileMediaBusy
                                ) {
                                    avatarInputRef.current?.click();
                                }
                            }}
                            onKeyDown={(e) => {
                                if (
                                    isSelf &&
                                    !profileMediaBusy &&
                                    (e.key === "Enter" || e.key === " ")
                                ) {
                                    e.preventDefault();
                                    avatarInputRef.current?.click();
                                }
                            }}
                            role={isSelf ? "button" : undefined}
                            tabIndex={isSelf ? 0 : undefined}
                        >
                            <Avatar
                                src={profile.avatarUrl}
                                alt={displayName}
                                wrapperClassName="h-full w-full"
                            />
                            {isSelf ? (
                                <div
                                    className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                    aria-hidden
                                >
                                    <Camera className="h-6 w-6 text-white" />
                                    <span className="px-2 text-center text-xs font-semibold text-white">
                                        {t("profile.changeAvatar")}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                        <div className="pb-1 md:pb-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                                    {displayName}
                                </h1>
                                {profile.isVerified ? (
                                    <BadgeCheck
                                        className="h-6 w-6 shrink-0 text-blue-500"
                                        aria-label={t("profile.verifiedSeller")}
                                    />
                                ) : null}
                                {isSelf ? (
                                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                        {t("profile.sellerBadge")}
                                    </span>
                                ) : null}
                                {!isSelf && profile.isTopSeller ? (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                                        {t("profile.topRated")}
                                    </span>
                                ) : null}
                            </div>
                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                {profile.bio ??
                                    profile.shopInformation?.shopDescription ??
                                    (profile.createdAt
                                        ? t("profile.joinedPreview", {
                                              date: new Date(
                                                  profile.createdAt,
                                              ).toLocaleDateString(undefined, {
                                                  month: "short",
                                                  year: "numeric",
                                              }),
                                          })
                                        : null)}
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full flex-wrap gap-3 md:w-auto md:justify-end">
                        {isSelf ? (
                            <>
                                <Link
                                    to="/settings"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
                                >
                                    <Settings className="h-4 w-4" />
                                    {t("header.settings")}
                                </Link>
                                <button
                                    type="button"
                                    disabled={
                                        profileMediaBusy
                                    }
                                    onClick={() => setCreatePostModalOpen(true)}
                                    className={cn(
                                        "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                                    )}
                                >
                                    <CirclePlus className="h-4 w-4" />
                                    {t("profile.createContent")}
                                </button>
                            </>
                        ) : profile.isFollowing ? (
                            <Button
                                variant="outline"
                                className="gap-2 rounded-xl"
                                onClick={handleUnfollow}
                            >
                                <UserCheck className="h-4 w-4" />
                                {t("profile.following")}
                            </Button>
                        ) : (
                            <Button
                                className="gap-2 rounded-xl"
                                onClick={handleFollow}
                            >
                                <UserPlus className="h-4 w-4" />
                                {t("profile.followShop")}
                            </Button>
                        )}
                        {!isSelf ? (
                            <>
                                <Link
                                    to={`/messages?userId=${profile.id}`}
                                    className="flex-1 sm:flex-none"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 rounded-xl sm:w-auto"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        {t("profile.message")}
                                    </Button>
                                </Link>
                                <div
                                    ref={menuRef}
                                    className="relative flex-1 sm:flex-none"
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full rounded-xl px-3 sm:w-auto"
                                        onClick={() =>
                                            setMenuOpen((prev) => !prev)
                                        }
                                        aria-haspopup="menu"
                                        aria-expanded={menuOpen}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    {menuOpen ? (
                                        <div
                                            role="menu"
                                            className="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                                        >
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    setReportOpen(true);
                                                }}
                                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                            >
                                                <Flag className="h-4 w-4 shrink-0 opacity-70" />
                                                Report user
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6 border-t border-border pt-6">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                            <span className="text-xl font-bold text-foreground">
                                {(profile.shopRating ?? 0).toFixed(1)}
                            </span>
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="text-sm text-muted-foreground">
                                / 5
                            </span>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {`${t("profile.reviews")} (${(
                                profile.reviewsCount ?? 0
                            ).toLocaleString()})`}
                        </p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xl font-bold text-foreground">
                            {(profile.followersCount ?? 0).toLocaleString()}
                        </span>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("profile.followersLabel")}
                        </p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xl font-bold text-foreground">
                            {(profile.followingCount ?? 0).toLocaleString()}
                        </span>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("profile.followingLabel")}
                        </p>
                    </div>
                </div>
            </div>
            {reportOpen ? (
                <ReportModal
                    targetType="user"
                    targetId={profile.id}
                    onClose={() => setReportOpen(false)}
                />
            ) : null}
        </section>
    );
}
