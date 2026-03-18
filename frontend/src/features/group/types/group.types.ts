export type GroupPrivacy = "public" | "private";

export interface Group {
    id: string;
    name: string;
    description?: string;
    coverImageUrl?: string;
    avatarColor?: string;
    avatarInitials?: string;
    privacy: GroupPrivacy;
    membersCount: number;
    postsPerDay?: number;
    isMember?: boolean;
    category?: string;
    friendsInGroup?: number;
    createdAt?: string;
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
