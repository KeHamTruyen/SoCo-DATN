import {
    Camera,
    CirclePlus,
    Flag,
    MapPin,
    MessageCircle,
    MoreHorizontal,
    Shield,
    UserCheck,
    UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { Button } from "../../../shared/ui/atoms/button";
import type { PublicUserProfile } from "../types/profile.types";
import { cn } from "../../../shared/lib/cn";
import { useTranslation } from "react-i18next";
import { ReportModal } from "../../report/components/ReportModal";

interface BuyerProfileHeaderProps {
    profile: PublicUserProfile;
    isSelf: boolean;
    onFollow?: () => void;
    onUnfollow?: () => void;
    /** Self only: after file picked, parent uploads & persists */
    onAvatarFile?: (file: File) => void | Promise<void>;
    onCoverFile?: (file: File) => void | Promise<void>;
    profileMediaBusy?: boolean;
    profileMediaError?: string | null;
    /** Self: open account settings (profile tab) */
    onOpenEditProfile?: () => void;
    /** Self: open account settings (privacy tab) */
    onOpenPrivacy?: () => void;
    onOpenCreatePost?: () => void;
}

export function BuyerProfileHeader({
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
                  }: BuyerProfileHeaderProps) {
    const cover = profile.coverUrl ?? profile.coverImage;
    const { t } = useTranslation();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

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
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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

            <div className="relative h-48 w-full bg-muted sm:h-64">
                {cover ? (
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-linear-to-br from-primary/40 via-primary/20 to-muted" />
                )}
                {isSelf && onCoverFile ? (
                    <button
                        type="button"
                        disabled={profileMediaBusy}
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 text-sm text-white backdrop-blur-sm transition-all hover:bg-black/60 disabled:opacity-50"
                    >
                        <Camera className="h-4 w-4" />
                        <span className="hidden sm:inline">{t("profile.changeCover")}</span>
                    </button>
                ) : null}
            </div>
            <div className="px-6 pb-6">
                {profileMediaError ? (
                    <p className="mt-2 text-sm text-destructive">{profileMediaError}</p>
                ) : null}
                <div className="mb-4 flex flex-col justify-between gap-4 sm:-mt-16 sm:flex-row sm:items-end">
                    <div className="relative">
                        <div
                            className={cn(
                                "group relative h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg sm:h-40 sm:w-40",
                                isSelf && onAvatarFile && "cursor-pointer",
                            )}
                            onClick={() => {
                                if (isSelf && onAvatarFile && !profileMediaBusy) {
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
                                alt={profile.fullName}
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
                        <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-background bg-success" />
                    </div>
                    <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:flex-nowrap">
                        {!isSelf ? (
                            <>
                                {profile.isFollowing ? (
                                    <Button
                                        variant="outline"
                                        className="flex-1 gap-2 sm:flex-none px-6 sm:px-8"
                                        onClick={onUnfollow}
                                    >
                                        <UserCheck className="h-4 w-4" />
                                        {t("profile.following")}
                                    </Button>
                                ) : (
                                    <Button className="flex-1 gap-2 sm:flex-none px-6 sm:px-8" onClick={onFollow}>
                                        <UserPlus className="h-4 w-4" />
                                        {t("profile.follow")}
                                    </Button>
                                )}
                                <Link to={`/messages?userId=${profile.id}`} className="flex-1 sm:flex-none">
                                    <Button variant="outline" className="w-full gap-2 px-6 sm:px-8">
                                        <MessageCircle className="h-4 w-4" />
                                        {t("profile.message")}
                                    </Button>
                                </Link>
                                <div ref={menuRef} className="relative flex-1 sm:flex-none">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full px-3 sm:w-auto"
                                        onClick={() => setMenuOpen((prev) => !prev)}
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
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 w-full min-w-0 flex-1 justify-center px-6 sm:w-auto sm:flex-none"
                                    disabled={profileMediaBusy || !onOpenEditProfile}
                                    onClick={() => onOpenEditProfile?.()}
                                >
                                    {t("profile.editProfile")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 w-full min-w-0 flex-1 justify-center gap-2 px-6 sm:w-auto sm:flex-none"
                                    disabled={profileMediaBusy || !onOpenPrivacy}
                                    onClick={() => onOpenPrivacy?.()}
                                >
                                    <Shield className="h-4 w-4 shrink-0" aria-hidden />
                                    {t("profile.privacy")}
                                </Button>
                                <Button
                                    type="button"
                                    className="h-10 w-full min-w-0 flex-1 justify-center gap-2 px-6 shadow-lg shadow-primary/20 sm:w-auto sm:flex-none"
                                    disabled={profileMediaBusy || !onOpenCreatePost}
                                    onClick={() => onOpenCreatePost?.()}
                                >
                                    <CirclePlus className="h-4 w-4 shrink-0" aria-hidden />
                                    {t("profile.createContent")}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{profile.fullName}</h1>
                        {profile.username ? (
                            <p className="text-muted-foreground">@{profile.username}</p>
                        ) : null}
                    </div>
                    {profile.bio ? (
                        <p className="max-w-2xl leading-relaxed text-muted-foreground">{profile.bio}</p>
                    ) : null}
                    {profile.location ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                        </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-primary">
                            <span className="font-bold text-foreground">
                                {(profile.followersCount ?? 0).toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">{t("profile.followersLabel")}</span>
                        </div>
                        <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-primary">
                            <span className="font-bold text-foreground">
                                {(profile.followingCount ?? 0).toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">{t("profile.followingLabel")}</span>
                        </div>
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
        </div>
    );
}
