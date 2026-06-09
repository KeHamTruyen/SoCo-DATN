import { Link } from "react-router-dom";
import { useGroupContext } from "../context/GroupContext";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { resolveProfilePath } from "../../../shared/lib/resolveProfilePath";
import { Avatar } from "../../../shared/ui";
import { copyToClipboard } from "../utils/groupDetailUtils";

export function GroupMembersTab() {
    const { user } = useAuthSession();
    const { 
        id, group, members, joinRequests, invites, tabLoading,
        handlePromoteDemote, handleRemoveMember, handleReviewRequest, handleCreateInvite
    } = useGroupContext();

    if (!group) return null;

    const isAdmin = group.memberRole === "ADMIN";
    const isModerator = group.memberRole === "MODERATOR";
    const canManageRoles = isAdmin;
    const canRemoveMembers = isAdmin || isModerator;

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            {tabLoading ? <p className="text-sm text-neutral-500">Loading members...</p> : (
                <div className="space-y-3">
                    {members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 dark:border-neutral-800">
                            <Link
                                to={resolveProfilePath(m.userId, user?.id)}
                                className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-90"
                            >
                                <Avatar src={m.user.avatarUrl} alt={m.user.fullName ?? m.user.username ?? "Member"} wrapperClassName="h-9 w-9 shrink-0" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold hover:text-primary hover:underline">{m.user.fullName ?? m.user.username ?? "Member"}</p>
                                    <p className="text-xs text-neutral-500">{m.role}</p>
                                </div>
                            </Link>
                            <div className="flex items-center gap-2">
                                {canManageRoles && m.role !== "ADMIN" && (
                                    <button type="button" onClick={() => void handlePromoteDemote(m, m.role === "MODERATOR" ? "MEMBER" : "MODERATOR")} className="rounded-md border px-2 py-1 text-xs">
                                        {m.role === "MODERATOR" ? "Demote" : "Promote"}
                                    </button>
                                )}
                                {canRemoveMembers && m.role !== "ADMIN" && (
                                    <button type="button" onClick={() => void handleRemoveMember(m)} className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-500">
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {!members.length && <p className="text-sm text-neutral-500">No members found.</p>}
                </div>
            )}
            
            {(canManageRoles || isModerator) && (
                <div className="mt-5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                    <p className="mb-2 text-sm font-semibold">Pending Requests</p>
                    <div className="space-y-2">
                        {joinRequests.map((r) => (
                            <div key={r.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-2 dark:border-neutral-800">
                                <Link
                                    to={resolveProfilePath(r.user.id, user?.id)}
                                    className="text-sm hover:text-primary hover:underline"
                                >
                                    {r.user.fullName ?? r.user.username ?? "User"}
                                </Link>
                                <div className="flex gap-2">
                                    <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => void handleReviewRequest(r.id, "approve")}>Approve</button>
                                    <button type="button" className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-500" onClick={() => void handleReviewRequest(r.id, "reject")}>Reject</button>
                                </div>
                            </div>
                        ))}
                        {!joinRequests.length && <p className="text-xs text-neutral-500">No pending requests.</p>}
                    </div>
                </div>
            )}
            
            {canManageRoles && (
                <div className="mt-5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold">Invites</p>
                        <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => void handleCreateInvite()}>
                            Create invite
                        </button>
                    </div>
                    <div className="space-y-2">
                        {invites.map((invite) => (
                            <div key={invite.id} className="flex items-center justify-between rounded-md border border-neutral-100 p-2 text-xs dark:border-neutral-800">
                                <span>{invite.code}</span>
                                <button type="button" onClick={() => void copyToClipboard(`${window.location.origin}/groups/${id}?invite=${invite.code}`)} className="rounded border px-2 py-1">
                                    Copy
                                </button>
                            </div>
                        ))}
                        {!invites.length && <p className="text-xs text-neutral-500">No active invites.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
