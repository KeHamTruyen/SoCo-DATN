import { createContext, useContext, ReactNode, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfileData } from "../hooks/useProfileData";
import { useProfileTabs } from "../hooks/useProfileTabs";
import { useProfilePosts } from "../hooks/useProfilePosts";
import { useProfileMedia } from "../hooks/useProfileMedia";
import { useProfileFollow } from "../hooks/useProfileFollow";
import type { FeedPost } from "../../feed/types/feed.types";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { useAppStore } from "../../../shared/state/appStore";

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
        showGuestAuthModal: boolean;
        setShowGuestAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
    };

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { isAuthenticated } = useAuthSession();

    const profileData = useProfileData(id);
    const showGuestAuthModal = useAppStore((state) => state.guestAuthModal.profile ?? false);
    const setGuestAuthModal = useAppStore((state) => state.setGuestAuthModal);
    const setShowGuestAuthModal: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
        const nextValue =
            typeof value === "function" ? value(showGuestAuthModal) : value;
        setGuestAuthModal("profile", nextValue);
    };
    const promptGuestAuth = () => setGuestAuthModal("profile", true);
    const profileTabs = useProfileTabs();
    const profilePosts = useProfilePosts(
        profileData.profile,
        profileData.user,
        profileData.setProfile,
        { isAuthenticated, onAuthRequired: promptGuestAuth },
    );
    const profileMedia = useProfileMedia(profileData.profile, profileData.setProfile, profileData.refreshProfile);
    const profileFollow = useProfileFollow(profileData.profile, profileData.setProfile, {
        isAuthenticated,
        onAuthRequired: promptGuestAuth,
    });

    const postDetailModalId = useAppStore((state) => state.profilePostDetailModalId);
    const setProfilePostDetailModalId = useAppStore((state) => state.setProfilePostDetailModalId);
    const createPostModalOpen = useAppStore((state) => state.profileCreatePostModalOpen);
    const setProfileCreatePostModalOpen = useAppStore((state) => state.setProfileCreatePostModalOpen);
    const [shopShareNotice, setShopShareNotice] = useState<string | null>(null);
    const setPostDetailModalId: React.Dispatch<React.SetStateAction<string | null>> = useCallback(
        (value) => {
            const nextValue =
                typeof value === "function" ? value(postDetailModalId) : value;
            setProfilePostDetailModalId(nextValue);
        },
        [postDetailModalId, setProfilePostDetailModalId],
    );
    const setCreatePostModalOpen: React.Dispatch<React.SetStateAction<boolean>> = useCallback(
        (value) => {
            const nextValue =
                typeof value === "function" ? value(createPostModalOpen) : value;
            setProfileCreatePostModalOpen(nextValue);
        },
        [createPostModalOpen, setProfileCreatePostModalOpen],
    );

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

    const value: ProfileContextValue = useMemo(
        () => ({
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
            showGuestAuthModal,
            setShowGuestAuthModal,
            ...profileData,
            ...profileTabs,
            ...profilePosts,
            ...profileMedia,
            ...profileFollow,
        }),
        [
            createPostModalOpen,
            handleShareShop,
            id,
            isSeller,
            openProfilePostModal,
            postDetailModalId,
            profileData,
            profileFollow,
            profileMedia,
            profileModalPost,
            profilePosts,
            profileTabs,
            shopShareNotice,
            showGuestAuthModal,
        ],
    );

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfileContext must be used within a ProfileProvider");
    }
    return context;
}
