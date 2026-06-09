export function resolveProfilePath(
    targetUserId: string,
    currentUserId?: string | null,
): string {
    return currentUserId && currentUserId === targetUserId
        ? "/profile"
        : `/profile/${targetUserId}`;
}
