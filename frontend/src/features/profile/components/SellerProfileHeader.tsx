import { BadgeCheck, MessageCircle, Share2, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { Button } from "../../../shared/ui/atoms/button";
import type { PublicUserProfile } from "../types/profile.types";

interface SellerProfileHeaderProps {
    profile: PublicUserProfile;
    isSelf: boolean;
    onFollow?: () => void;
    onUnfollow?: () => void;
}

export function SellerProfileHeader({
    profile,
    isSelf,
    onFollow,
    onUnfollow,
}: SellerProfileHeaderProps) {
    return (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-neutral-50 shadow-sm dark:border-neutral-800">
                            <Avatar
                                src={profile.avatarUrl}
                                alt={profile.fullName}
                                wrapperClassName="h-full w-full rounded-2xl"
                            />
                        </div>
                        {profile.isVerified && (
                            <div className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-info p-1 dark:border-neutral-900">
                                <BadgeCheck className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{profile.shopName ?? profile.fullName}</h1>
                            {profile.isTopSeller && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                                    Top Rated
                                </span>
                            )}
                        </div>
                        {profile.bio && (
                            <p className="text-sm text-neutral-500">{profile.bio}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4">
                            {profile.shopRating !== undefined && (
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-primary-400 text-primary-400" />
                                    <span className="text-sm font-bold">{profile.shopRating}/5</span>
                                    <span className="ml-1 text-xs text-neutral-400">Shop Rating</span>
                                </div>
                            )}
                            {profile.shopResponseRate !== undefined && (
                                <div className="flex items-center gap-1">
                                    <Zap className="h-4 w-4 text-success" />
                                    <span className="text-sm font-bold">{profile.shopResponseRate}%</span>
                                    <span className="ml-1 text-xs text-neutral-400">Chat Response</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex w-full gap-3 md:w-auto">
                    {isSelf ? (
                        <>
                            <Button variant="outline" className="flex-1 md:flex-none">
                                Edit Profile
                            </Button>
                            <Button className="flex-1 md:flex-none gap-2">
                                <Share2 className="h-4 w-4" />
                                Share Shop
                            </Button>
                        </>
                    ) : (
                        <>
                            {profile.isFollowing ? (
                                <Button
                                    variant="outline"
                                    className="flex-1 md:flex-none"
                                    onClick={onUnfollow}
                                >
                                    Following
                                </Button>
                            ) : (
                                <Button className="flex-1 md:flex-none" onClick={onFollow}>
                                    Follow
                                </Button>
                            )}
                            <Link to={`/messages?userId=${profile.id}`}>
                                <Button variant="outline" className="gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Message
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
