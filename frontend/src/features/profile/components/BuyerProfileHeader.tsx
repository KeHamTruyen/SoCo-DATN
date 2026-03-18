import { MapPin, MessageCircle, UserCheck, UserPlus } from "lucide-react";
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
    return (
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
            <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-slate-900 sm:h-40 sm:w-40">
                    <Avatar
                        src={profile.avatarUrl ?? ""}
                        alt={profile.fullName}
                        wrapperClassName="h-full w-full"
                    />
                </div>
                <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white bg-green-500 dark:border-slate-900" />
            </div>

            <div className="flex flex-1 flex-col items-center gap-4 md:items-start">
                <div className="w-full space-y-2">
                    <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                    {profile.username && (
                        <p className="text-slate-500">@{profile.username}</p>
                    )}
                    {profile.bio && (
                        <p className="max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">
                            {profile.bio}
                        </p>
                    )}
                    {profile.location && (
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-6 md:justify-start">
                        <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-primary">
                            <span className="font-bold">{profile.followersCount.toLocaleString()}</span>
                            <span className="text-sm text-slate-500">Followers</span>
                        </div>
                        <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-primary">
                            <span className="font-bold">{profile.followingCount.toLocaleString()}</span>
                            <span className="text-sm text-slate-500">Following</span>
                        </div>
                        <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-primary">
                            <span className="font-bold">{profile.postsCount.toLocaleString()}</span>
                            <span className="text-sm text-slate-500">Posts</span>
                        </div>
                    </div>
                </div>

                {!isSelf && (
                    <div className="flex w-full gap-3 sm:w-auto">
                        {profile.isFollowing ? (
                            <Button
                                variant="outline"
                                className="flex-1 gap-2 sm:flex-none"
                                onClick={onUnfollow}
                            >
                                <UserCheck className="h-4 w-4" />
                                Following
                            </Button>
                        ) : (
                            <Button className="flex-1 gap-2 sm:flex-none" onClick={onFollow}>
                                <UserPlus className="h-4 w-4" />
                                Follow
                            </Button>
                        )}
                        <Link to={`/messages?userId=${profile.id}`}>
                            <Button variant="outline" className="flex-1 gap-2 sm:flex-none">
                                <MessageCircle className="h-4 w-4" />
                                Message
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
