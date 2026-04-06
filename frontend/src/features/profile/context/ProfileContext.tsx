import { createContext, useContext, ReactNode, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfileData } from "../hooks/useProfileData";
import { useProfileTabs } from "../hooks/useProfileTabs";
import { useProfilePosts } from "../hooks/useProfilePosts";
import { useProfileMedia } from "../hooks/useProfileMedia";
import { useProfileFollow } from "../hooks/useProfileFollow";
import type { FeedPost } from "../../feed/types/feed.types";

export type ProfileContextValue = ReturnType<typeof useProfileData> &
    ReturnType<typeof useProfileTabs> &
    ReturnType<typeof useProfilePosts> &
    ReturnType<typeof useProfileMedia> &
    ReturnType<typeof useProfileFollow> & {
        id?: string;
        isSeller: boolean;
        postDetailModalId: string | null;
        setPostDetailModalId: React.Dispatch<React.SetStateAction<string | null>>;
        createPostModalOpen: boolean;
        setCreatePostModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
        shopShareNotice: string | null;
        handleShareShop: () => Promise<void>;
        openProfilePostModal: (post: FeedPost) => void;
        profileModalPost: FeedPost | null;
    };

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();

    const profileData = useProfileData(id);
    const profileTabs = useProfileTabs();
    const profilePosts = useProfilePosts(profileData.profile, profileData.user, profileData.setProfile);
    const profileMedia = useProfileMedia(profileData.profile, profileData.setProfile, profileData.refreshProfile);
    const profileFollow = useProfileFollow(profileData.profile, profileData.setProfile);

    const [postDetailModalId, setPostDetailModalId] = useState<string | null>(null);
    const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
    const [shopShareNotice, setShopShareNotice] = useState<string | null>(null);

    const isSeller = profileData.profile?.role === "seller";

    const profileModalPost = useMemo(
        () =>
            postDetailModalId
                ? (profilePosts.posts.find((p) => p.id === postDetailModalId) ?? null)
                : null,
        [postDetailModalId, profilePosts.posts]
    );

    const openProfilePostModal = useCallback((post: FeedPost) => {
        setPostDetailModalId(post.id);
    }, []);

    const handleShareShop = useCallback(async () => {
        if (!profileData.profile) return;
        const url = `${window.location.origin}/profile/${profileData.profile.id}`;
        try {
            await navigator.clipboard.writeText(url);
            setShopShareNotice(t("feed.linkCopied"));
            window.setTimeout(() => setShopShareNotice(null), 2500);
        } catch {
            setShopShareNotice(null);
        }
    }, [profileData.profile, t]);

    const value: ProfileContextValue = {
        id,
        isSeller,
        postDetailModalId,
        setPostDetailModalId,
        createPostModalOpen,
        setCreatePostModalOpen,
        shopShareNotice,
        handleShareShop,
        openProfilePostModal,
        profileModalPost,
        ...profileData,
        ...profileTabs,
        ...profilePosts,
        ...profileMedia,
        ...profileFollow,
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfileContext must be used within a ProfileProvider");
    }
    return context;
}
