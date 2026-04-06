import { useState, useEffect } from "react";
import { groupApi } from "../../group/api/groupApi";
import type { GroupMemberBrief, GroupJoinRequest, GroupInvite, Group } from "../../group/types/group.types";

export function useGroupMembers(id: string | undefined, activeTab: string, group: Group | null) {
    const [members, setMembers] = useState<GroupMemberBrief[]>([]);
    const [joinRequests, setJoinRequests] = useState<GroupJoinRequest[]>([]);
    const [invites, setInvites] = useState<GroupInvite[]>([]);
    const [tabLoading, setTabLoading] = useState(false);
    const [mediaRows, setMediaRows] = useState<Array<{ id: string; mediaUrls: string[]; mediaType?: string }>>([]);
    const [productRows, setProductRows] = useState<Array<Record<string, unknown>>>([]);

    const isAdmin = group?.memberRole === "ADMIN";
    const isModerator = group?.memberRole === "MODERATOR";
    const canManageRoles = isAdmin;
    const canRemoveMembers = isAdmin || isModerator;

    useEffect(() => {
        if (!id || activeTab === "discussion") return;
        let mounted = true;
        void (async () => {
            setTabLoading(true);
            try {
                if (activeTab === "members") {
                    const res = await groupApi.getGroupMembers(id);
                    if (mounted) setMembers(res.data ?? []);
                    if (canManageRoles || isModerator) {
                        const requestsRes = await groupApi.listJoinRequests(id);
                        if (mounted) setJoinRequests(requestsRes.data ?? []);
                    }
                    if (canManageRoles) {
                        const invitesRes = await groupApi.listInvites(id);
                        if (mounted) setInvites(invitesRes ?? []);
                    }
                } else if (activeTab === "media") {
                    const res = await groupApi.getGroupMedia(id);
                    if (mounted) setMediaRows(res.data ?? []);
                } else if (activeTab === "products") {
                    const res = await groupApi.getGroupProducts(id);
                    if (mounted) setProductRows(res.data ?? []);
                }
            } catch {
                if (!mounted) return;
                if (activeTab === "members") setMembers([]);
                if (activeTab === "media") setMediaRows([]);
                if (activeTab === "products") setProductRows([]);
            } finally {
                if (mounted) setTabLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [activeTab, id, group?.memberRole, canManageRoles, isModerator]);

    const handlePromoteDemote = async (target: GroupMemberBrief, role: "MODERATOR" | "MEMBER") => {
        if (!id || !canManageRoles) return;
        await groupApi.updateMemberRole(id, target.userId, role);
        setMembers((prev) => prev.map((m) => (m.userId === target.userId ? { ...m, role } : m)));
    };

    const handleRemoveMember = async (target: GroupMemberBrief) => {
        if (!id || !canRemoveMembers) return;
        await groupApi.removeMember(id, target.userId);
        setMembers((prev) => prev.filter((m) => m.userId !== target.userId));
    };

    const handleReviewRequest = async (requestId: string, action: "approve" | "reject") => {
        if (!id) return;
        if (action === "approve") await groupApi.approveJoinRequest(id, requestId);
        else await groupApi.rejectJoinRequest(id, requestId);
        setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
    };

    const handleCreateInvite = async () => {
        if (!id || !canManageRoles) return;
        const invite = await groupApi.createInvite(id, { expiresInHours: 72, maxUses: 1 });
        setInvites((prev) => [invite, ...prev]);
    };

    return {
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
    };
}
