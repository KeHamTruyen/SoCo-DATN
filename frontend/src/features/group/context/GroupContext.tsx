import { createContext, useContext, type ReactNode, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useGroupData } from "../hooks/useGroupData";
import { useGroupTabs, type GroupTab } from "../hooks/useGroupTabs";
import { useGroupPosts } from "../hooks/useGroupPosts";
import { useGroupMembers } from "../hooks/useGroupMembers";
import { useGroupAction } from "../hooks/useGroupAction";
import type { Group, GroupMemberBrief, GroupJoinRequest, GroupInvite } from "../types/group.types";
import type { FeedPost, CreatePostPayload } from "../../feed/types/feed.types";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { useAppStore } from "../../../shared/state/appStore";

interface GroupContextValue {
    id: string | undefined;
    group: Group | null;
    isLoading: boolean;
    setGroup: React.Dispatch<React.SetStateAction<Group | null>>;
    
    // UI state for group interactions
    showUpdateModal: boolean;
    setShowUpdateModal: React.Dispatch<React.SetStateAction<boolean>>;
    showPostModal: boolean;
    setShowPostModal: React.Dispatch<React.SetStateAction<boolean>>;
    showGuestAuthModal: boolean;
    setShowGuestAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
    
    // Actions
    isLeaving: boolean;
    leaveError: string | null;
    setLeaveError: React.Dispatch<React.SetStateAction<string | null>>;
    handleJoinGroup: () => Promise<void>;
    handleLeaveGroup: () => Promise<boolean>;

    // Tabs
    activeTab: GroupTab;
    setActiveTab: React.Dispatch<React.SetStateAction<GroupTab>>;

    // Posts
    posts: FeedPost[];
    postsLoading: boolean;
    handleCreatePost: (payload: CreatePostPayload) => Promise<void>;
    handleLike: (postId: string) => Promise<void>;
    handleComment: (postId: string, content: string) => Promise<void>;
    handleDeletePost: (postId: string) => Promise<void>;

    // Members & Media & Products
    members: GroupMemberBrief[];
    joinRequests: GroupJoinRequest[];
    invites: GroupInvite[];
    mediaRows: Array<{ id: string; mediaUrls: string[]; mediaType?: string }>;
    productRows: Array<Record<string, unknown>>;
    tabLoading: boolean;
    handlePromoteDemote: (target: GroupMemberBrief, role: "MODERATOR" | "MEMBER") => Promise<void>;
    handleRemoveMember: (target: GroupMemberBrief) => Promise<void>;
    handleReviewRequest: (requestId: string, action: "approve" | "reject") => Promise<void>;
    handleCreateInvite: () => Promise<void>;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function GroupProvider({ children }: { children: ReactNode }) {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAuthSession();
    
    const { group, setGroup, isLoading } = useGroupData(id);
    const { activeTab, setActiveTab } = useGroupTabs();
    const showGuestAuthModal = useAppStore((state) => state.guestAuthModal.group ?? false);
    const setGuestAuthModal = useAppStore((state) => state.setGuestAuthModal);
    const setShowGuestAuthModal: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
        const nextValue =
            typeof value === "function" ? value(showGuestAuthModal) : value;
        setGuestAuthModal("group", nextValue);
    };
    const promptGuestAuth = () => setGuestAuthModal("group", true);
    const { isLeaving, leaveError, setLeaveError, handleJoinGroup, handleLeaveGroup } = useGroupAction(
        id,
        group,
        setGroup,
        { isAuthenticated, onAuthRequired: promptGuestAuth },
    );
    const { posts, postsLoading, handleCreatePost, handleLike, handleComment, handleDeletePost } = useGroupPosts(
        id,
        activeTab,
        { isAuthenticated, onAuthRequired: promptGuestAuth },
    );
    const { 
        members, joinRequests, invites, mediaRows, productRows, tabLoading,
        handlePromoteDemote, handleRemoveMember, handleReviewRequest, handleCreateInvite 
    } = useGroupMembers(id, activeTab, group);

    const showUpdateModal = useAppStore((state) => state.groupUpdateModalOpen);
    const setGroupUpdateModalOpen = useAppStore((state) => state.setGroupUpdateModalOpen);
    const showPostModal = useAppStore((state) => state.groupPostModalOpen);
    const setGroupPostModalOpen = useAppStore((state) => state.setGroupPostModalOpen);
    const setShowUpdateModal: React.Dispatch<React.SetStateAction<boolean>> = useCallback(
        (value) => {
            const nextValue =
                typeof value === "function" ? value(showUpdateModal) : value;
            setGroupUpdateModalOpen(nextValue);
        },
        [setGroupUpdateModalOpen, showUpdateModal],
    );
    const setShowPostModal: React.Dispatch<React.SetStateAction<boolean>> = useCallback(
        (value) => {
            const nextValue =
                typeof value === "function" ? value(showPostModal) : value;
            setGroupPostModalOpen(nextValue);
        },
        [setGroupPostModalOpen, showPostModal],
    );

    const value = useMemo(
        () => ({
                id,
                group,
                isLoading,
                setGroup,
                showUpdateModal,
                setShowUpdateModal,
                showPostModal,
                setShowPostModal,
                showGuestAuthModal,
                setShowGuestAuthModal,
                isLeaving,
                leaveError,
                setLeaveError,
                handleJoinGroup,
                handleLeaveGroup,
                activeTab,
                setActiveTab,
                posts,
                postsLoading,
                handleCreatePost,
                handleLike,
                handleComment,
                handleDeletePost,
                members,
                joinRequests,
                invites,
                mediaRows,
                productRows,
                tabLoading,
                handlePromoteDemote,
                handleRemoveMember,
                handleReviewRequest,
                handleCreateInvite,
            }),
        [
            activeTab,
            group,
            handleComment,
            handleCreateInvite,
            handleCreatePost,
            handleDeletePost,
            handleJoinGroup,
            handleLeaveGroup,
            handleLike,
            handlePromoteDemote,
            handleRemoveMember,
            handleReviewRequest,
            id,
            invites,
            isLoading,
            isLeaving,
            joinRequests,
            leaveError,
            mediaRows,
            members,
            posts,
            postsLoading,
            productRows,
            showGuestAuthModal,
            showPostModal,
            showUpdateModal,
            tabLoading,
        ],
    );

    return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroupContext() {
    const context = useContext(GroupContext);
    if (!context) {
        throw new Error("useGroupContext must be used within GroupProvider");
    }
    return context;
}
