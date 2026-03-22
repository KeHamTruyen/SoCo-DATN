import {
    Camera,
    MapPin,
    MessageCircle,
    Shield,
    UserCheck,
    UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { Button } from "../../../shared/ui/atoms/button";
import type { PublicUserProfile } from "../types/profile.types";

interface BuyerProfileHeaderProps {
    profile: PublicUserProfile;
    isSelf: boolean;
    onFollow?: () => void;
    onUnfollow?: () => void;
}

export function BuyerProfileHeader({
    profile,
    isSelf,
    onFollow,
    onUnfollow,
}: BuyerProfileHeaderProps) {
    const cover = profile.coverUrl ?? profile.coverImage;

    return (
        <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="relative h-48 w-full bg-neutral-200 dark:bg-neutral-800 sm:h-64">
                {cover ? (
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/40 via-primary/20 to-neutral-800 dark:from-primary/30 dark:to-neutral-950" />
                )}
                {isSelf ? (
                    <button
                        type="button"
                        className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 text-sm text-white backdrop-blur-sm transition-all hover:bg-black/60"
                    >
                        <Camera className="h-4 w-4" />
                        <span className="hidden sm:inline">Đổi ảnh bìa</span>
                    </button>
                ) : null}
            </div>
            <div className="px-6 pb-6">
                <div className="mb-4 flex flex-col justify-between gap-4 sm:-mt-20 sm:flex-row sm:items-end">
                    <div className="relative">
                        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-neutral-100 shadow-lg dark:border-neutral-900 sm:h-40 sm:w-40">
                            <Avatar
                                src={profile.avatarUrl}
                                alt={profile.fullName}
                                wrapperClassName="h-full w-full"
                            />
                        </div>
                        <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white bg-success dark:border-neutral-900" />
                    </div>
                    <div className="flex w-full gap-3 sm:w-auto">
                        {!isSelf ? (
                            <>
                                {profile.isFollowing ? (
                                    <Button
                                        variant="outline"
                                        className="flex-1 gap-2 sm:flex-none px-6 sm:px-8"
                                        onClick={onUnfollow}
                                    >
                                        <UserCheck className="h-4 w-4" />
                                        Đang theo dõi
                                    </Button>
                                ) : (
                                    <Button className="flex-1 gap-2 sm:flex-none px-6 sm:px-8" onClick={onFollow}>
                                        <UserPlus className="h-4 w-4" />
                                        Theo dõi
                                    </Button>
                                )}
                                <Link to={`/messages?userId=${profile.id}`} className="flex-1 sm:flex-none">
                                    <Button variant="outline" className="w-full gap-2 px-6 sm:px-8">
                                        <MessageCircle className="h-4 w-4" />
                                        Nhắn tin
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Button type="button" className="flex-1 sm:flex-none px-6">
                                    Chỉnh sửa hồ sơ
                                </Button>
                                <Button type="button" variant="outline" className="flex-1 gap-2 sm:flex-none px-6">
                                    <Shield className="h-4 w-4" />
                                    Quyền riêng tư
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">{profile.fullName}</h1>
                        {profile.username ? (
                            <p className="text-neutral-500 dark:text-neutral-400">@{profile.username}</p>
                        ) : null}
                    </div>
                    {profile.bio ? (
                        <p className="max-w-2xl leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {profile.bio}
                        </p>
                    ) : null}
                    {profile.location ? (
                        <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                        </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-primary">
                            <span className="font-bold dark:text-white">
                                {profile.followersCount.toLocaleString()}
                            </span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">Người theo dõi</span>
                        </div>
                        <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-primary">
                            <span className="font-bold dark:text-white">
                                {profile.followingCount.toLocaleString()}
                            </span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">Đang theo dõi</span>
                        </div>
                        <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-primary">
                            <span className="font-bold dark:text-white">
                                {profile.postsCount.toLocaleString()}
                            </span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">Bài viết</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
