import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupApi } from "../../group/api/groupApi";
import type { GroupMemberBrief, GroupJoinRequest, GroupInvite, Group } from "../../group/types/group.types";
import { queryKeys } from "../../../shared/query/queryKeys";

export function useGroupMembers(id: string | undefined, activeTab: string, group: Group | null) {
    const queryClient = useQueryClient();

    const isAdmin = group?.memberRole === "ADMIN";
    const isModerator = group?.memberRole === "MODERATOR";
    const canManageRoles = isAdmin;
    const canRemoveMembers = isAdmin || isModerator;
    const membersKey = id ? [...queryKeys.group.detail(id), "members"] as const : ["group", "members", "empty"] as const;
    const requestsKey = id ? [...queryKeys.group.detail(id), "joinRequests"] as const : ["group", "joinRequests", "empty"] as const;
    const invitesKey = id ? [...queryKeys.group.detail(id), "invites"] as const : ["group", "invites", "empty"] as const;
    const mediaKey = id ? [...queryKeys.group.detail(id), "media"] as const : ["group", "media", "empty"] as const;
    const productsKey = id ? [...queryKeys.group.detail(id), "products"] as const : ["group", "products", "empty"] as const;

    const membersQuery = useQuery({
        queryKey: membersKey,
        enabled: Boolean(id) && activeTab === "members",
        queryFn: async () => {
            const res = await groupApi.getGroupMembers(id!);
            return res.data ?? [];
        },
    });
    const requestsQuery = useQuery({
        queryKey: requestsKey,
        enabled: Boolean(id) && activeTab === "members" && (canManageRoles || isModerator),
        queryFn: async () => {
            const res = await groupApi.listJoinRequests(id!);
            return res.data ?? [];
        },
    });
    const invitesQuery = useQuery({
        queryKey: invitesKey,
        enabled: Boolean(id) && activeTab === "members" && canManageRoles,
        queryFn: () => groupApi.listInvites(id!),
    });
    const mediaQuery = useQuery({
        queryKey: mediaKey,
        enabled: Boolean(id) && activeTab === "media",
        queryFn: async () => {
            const res = await groupApi.getGroupMedia(id!);
            return res.data ?? [];
        },
    });
    const productsQuery = useQuery({
        queryKey: productsKey,
        enabled: Boolean(id) && activeTab === "products",
        queryFn: async () => {
            const res = await groupApi.getGroupProducts(id!);
            return res.data ?? [];
        },
    });

    const updateMemberRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: "MODERATOR" | "MEMBER" }) =>
            groupApi.updateMemberRole(id!, userId, role),
        onSuccess(_, variables) {
            queryClient.setQueryData<GroupMemberBrief[]>(
                membersKey,
                (prev = []) =>
                    prev.map((member) =>
                        member.userId === variables.userId
                            ? { ...member, role: variables.role }
                            : member,
                    ),
            );
        },
    });
    const removeMemberMutation = useMutation({
        mutationFn: (userId: string) => groupApi.removeMember(id!, userId),
        onSuccess(_, userId) {
            queryClient.setQueryData<GroupMemberBrief[]>(
                membersKey,
                (prev = []) => prev.filter((member) => member.userId !== userId),
            );
        },
    });
    const reviewRequestMutation = useMutation({
        mutationFn: ({ requestId, action }: { requestId: string; action: "approve" | "reject" }) =>
            action === "approve"
                ? groupApi.approveJoinRequest(id!, requestId)
                : groupApi.rejectJoinRequest(id!, requestId),
        onSuccess(_, variables) {
            queryClient.setQueryData<GroupJoinRequest[]>(
                requestsKey,
                (prev = []) => prev.filter((request) => request.id !== variables.requestId),
            );
        },
    });
    const createInviteMutation = useMutation({
        mutationFn: () => groupApi.createInvite(id!, { expiresInHours: 72, maxUses: 1 }),
        onSuccess(invite) {
            queryClient.setQueryData<GroupInvite[]>(invitesKey, (prev = []) => [invite, ...prev]);
        },
    });

    const handlePromoteDemote = async (target: GroupMemberBrief, role: "MODERATOR" | "MEMBER") => {
        if (!id || !canManageRoles) return;
        await updateMemberRoleMutation.mutateAsync({ userId: target.userId, role });
    };

    const handleRemoveMember = async (target: GroupMemberBrief) => {
        if (!id || !canRemoveMembers) return;
        await removeMemberMutation.mutateAsync(target.userId);
    };

    const handleReviewRequest = async (requestId: string, action: "approve" | "reject") => {
        if (!id) return;
        await reviewRequestMutation.mutateAsync({ requestId, action });
    };

    const handleCreateInvite = async () => {
        if (!id || !canManageRoles) return;
        await createInviteMutation.mutateAsync();
    };

    const tabLoading = useMemo(
        () =>
            membersQuery.isLoading ||
            requestsQuery.isLoading ||
            invitesQuery.isLoading ||
            mediaQuery.isLoading ||
            productsQuery.isLoading,
        [
            invitesQuery.isLoading,
            mediaQuery.isLoading,
            membersQuery.isLoading,
            productsQuery.isLoading,
            requestsQuery.isLoading,
        ],
    );

    return {
        members: membersQuery.data ?? [],
        joinRequests: requestsQuery.data ?? [],
        invites: invitesQuery.data ?? [],
        mediaRows: mediaQuery.data ?? [],
        productRows: productsQuery.data ?? [],
        tabLoading,
        handlePromoteDemote,
        handleRemoveMember,
        handleReviewRequest,
        handleCreateInvite,
    };
}
