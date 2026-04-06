import { useCallback } from "react";
import { profileApi } from "../api/profileApi";
import type { PublicUserProfile } from "../types/profile.types";

export function useProfileFollow(
    profile: PublicUserProfile | null,
    setProfile: React.Dispatch<React.SetStateAction<PublicUserProfile | null>>
) {
    const handleFollow = useCallback(async () => {
        if (!profile) return;
        const res = await profileApi.followUser(profile.id);
        setProfile((p) => {
            if (!p) return p;
            const wasFollowing = Boolean(p.isFollowing);
            const nowFollowing = Boolean(res.followed);
            let followersCount = p.followersCount ?? 0;
            if (nowFollowing && !wasFollowing) followersCount += 1;
            if (!nowFollowing && wasFollowing)
                followersCount = Math.max(0, followersCount - 1);
            return { ...p, isFollowing: res.followed, followersCount };
        });
    }, [profile, setProfile]);

    const handleUnfollow = useCallback(async () => {
        if (!profile) return;
        const res = await profileApi.unfollowUser(profile.id);
        setProfile((p) => {
            if (!p) return p;
            const wasFollowing = Boolean(p.isFollowing);
            const nowFollowing = Boolean(res.followed);
            let followersCount = p.followersCount ?? 0;
            if (nowFollowing && !wasFollowing) followersCount += 1;
            if (!nowFollowing && wasFollowing)
                followersCount = Math.max(0, followersCount - 1);
            return { ...p, isFollowing: res.followed, followersCount };
        });
    }, [profile, setProfile]);

    return {
        handleFollow,
        handleUnfollow
    };
}
