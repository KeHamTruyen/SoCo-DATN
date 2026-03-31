export type GroupPrivacy = "public" | "private" | "PUBLIC" | "PRIVATE" | "SECRET";

export interface GroupMemberBrief {
    id: string;
    userId: string;
    role: "ADMIN" | "MODERATOR" | "MEMBER";
    user: {
        id: string;
        username?: string;
        fullName?: string;
        avatarUrl?: string;
        isVerified?: boolean;
    };
}

export interface GroupCreator {
    id: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
    isVerified?: boolean;
}

export interface Group {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    coverImageUrl?: string;
    avatarUrl?: string;
    avatarColor?: string;
    avatarInitials?: string;
    privacy: GroupPrivacy;
    membersCount: number;
    postsCount?: number;
    postsPerDay?: number;
    isMember?: boolean;
    memberRole?: "ADMIN" | "MODERATOR" | "MEMBER" | null;
    category?: string;
    friendsInGroup?: number;
    createdAt?: string;
    createdBy?: string;
    creator?: GroupCreator;
    members?: GroupMemberBrief[];
    capabilities?: {
        canManageRoles: boolean;
        canReviewRequests: boolean;
        canManageInvites: boolean;
        canRemoveMembers: boolean;
    };
}

export interface GroupJoinRequest {
    id: string;
    groupId: string;
    userId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    user: GroupCreator;
}

export interface GroupInvite {
    id: string;
    groupId: string;
    code: string;
    expiresAt: string;
    maxUses: number;
    usedCount: number;
    isActive: boolean;
}

export interface GroupsListResponse {
    items: Group[];
    total: number;
    page: number;
    pageSize: number;
}

export interface GroupsQueryParams {
    q?: string;
    page?: number;
    pageSize?: number;
}
