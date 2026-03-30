import {
    BadgeCheck,
    Camera,
    CirclePlus,
    MessageCircle,
    Pencil,
    Shield,
    Star,
    UserPlus,
    UserCheck,
} from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { Button } from "../../../shared/ui/atoms/button";
import { cn } from "../../../shared/lib/cn";
import type { PublicUserProfile } from "../types/profile.types";
import { useTranslation } from "react-i18next";

interface SellerProfileHeaderProps {
    profile: PublicUserProfile;
    isSelf: boolean;
    onFollow?: () => void;
    onUnfollow?: () => void;
    onAvatarFile?: (file: File) => void | Promise<void>;
    onCoverFile?: (file: File) => void | Promise<void>;
    profileMediaBusy?: boolean;
    profileMediaError?: string | null;
    onOpenEditProfile?: () => void;
    onOpenPrivacy?: () => void;
    onOpenCreatePost?: () => void;
}

export function SellerProfileHeader({
    profile,
    isSelf,
    onFollow,
    onUnfollow,
    onAvatarFile,
    onCoverFile,
    profileMediaBusy = false,
    profileMediaError = null,
                      onOpenEditProfile,
                      onOpenPrivacy,
                      onOpenCreatePost,
                  }: SellerProfileHeaderProps) {
    const { t } = useTranslation();
    const cover = profile.coverUrl ?? profile.coverImage;
    const displayName = profile.shopName ?? profile.fullName;
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarInput = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f && onAvatarFile) void onAvatarFile(f);
    };

    const handleCoverInput = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f && onCoverFile) void onCoverFile(f);
    };

    return (
        <section
            className={cn(
                "overflow-hidden border border-border bg-card shadow-sm",
                isSelf ? "rounded-3xl" : "sm:rounded-2xl",
            )}
        >
            {isSelf && onCoverFile ? (
                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverInput}
                />
            ) : null}
            {isSelf && onAvatarFile ? (
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
                {isSelf && onCoverFile ? (
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
                                isSelf && onAvatarFile && "cursor-pointer",
                            )}
                            onClick={() => {
                                if (
                                    isSelf &&
                                    onAvatarFile &&
                                    !profileMediaBusy
                                ) {
                                    avatarInputRef.current?.click();
                                }
                            }}
                            onKeyDown={(e) => {
                                if (
                                    isSelf &&
                                    onAvatarFile &&
                                    !profileMediaBusy &&
                                    (e.key === "Enter" || e.key === " ")
                                ) {
                                    e.preventDefault();
                                    avatarInputRef.current?.click();
                                }
                            }}
                            role={isSelf && onAvatarFile ? "button" : undefined}
                            tabIndex={isSelf && onAvatarFile ? 0 : undefined}
                        >
                            <Avatar
                                src={profile.avatarUrl}
                                alt={displayName}
                                wrapperClassName="h-full w-full"
                            />
                            {isSelf && onAvatarFile ? (
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
                                <button
                                    type="button"
                                    disabled={
                                        profileMediaBusy || !onOpenEditProfile
                                    }
                                    onClick={() => onOpenEditProfile?.()}
                                    className={cn(
                                        "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                                    )}
                                >
                                    <Pencil className="h-4 w-4" />
                                    {t("profile.editProfile")}
                                </button>
                                <button
                                    type="button"
                                    disabled={
                                        profileMediaBusy || !onOpenPrivacy
                                    }
                                    onClick={() => onOpenPrivacy?.()}
                                    className={cn(
                                        "inline-flex h-10 min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal rounded-xl border border-border bg-background px-4 text-center text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:whitespace-nowrap",
                                    )}
                                >
                                    <Shield
                                        className="h-4 w-4 shrink-0"
                                        aria-hidden
                                    />
                                    {t("profile.privacy")}
                                </button>
                                <button
                                    type="button"
                                    disabled={
                                        profileMediaBusy || !onOpenCreatePost
                                    }
                                    onClick={() => onOpenCreatePost?.()}
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
                                onClick={onUnfollow}
                            >
                                <UserCheck className="h-4 w-4" />
                                {t("profile.following")}
                            </Button>
                        ) : (
                            <Button
                                className="gap-2 rounded-xl"
                                onClick={onFollow}
                            >
                                <UserPlus className="h-4 w-4" />
                                {t("profile.followShop")}
                            </Button>
                        )}
                        {!isSelf ? (
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
        </section>
    );
}
