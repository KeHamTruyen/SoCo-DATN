import { useState } from "react";
import { groupApi } from "../../group/api/groupApi";
import type { Group } from "../../group/types/group.types";
import { HttpError } from "../../../shared/api/httpClient";

export function useGroupAction(id: string | undefined, group: Group | null, setGroup: React.Dispatch<React.SetStateAction<Group | null>>) {
    const [isLeaving, setIsLeaving] = useState(false);
    const [leaveError, setLeaveError] = useState<string | null>(null);

    const handleJoinGroup = async () => {
        if (!group || !id || group.isMember) return;
        try {
            const joined = await groupApi.joinGroup(id);
            if (joined.requested) return;
            setGroup((g) =>
                g
                    ? {
                          ...g,
                          isMember: true,
                          memberRole: "MEMBER",
                          membersCount: g.membersCount + 1,
                      }
                    : g,
            );
        } catch { /* silently ignore */ }
    };

    const handleLeaveGroup = async () => {
        if (!group || !id || !group.isMember) return;
        setIsLeaving(true);
        setLeaveError(null);
        try {
            await groupApi.leaveGroup(id);
            setGroup((g) =>
                g
                    ? {
                          ...g,
                          isMember: false,
                          memberRole: null,
                          membersCount: Math.max(0, g.membersCount - 1),
                      }
                    : g,
            );
            return true;
        } catch (error) {
            if (error instanceof HttpError) {
                setLeaveError(error.message);
            } else {
                setLeaveError("Unable to leave this group right now. Please try again.");
            }
            return false;
        } finally {
            setIsLeaving(false);
        }
    };

    return {
        isLeaving,
        leaveError,
        setLeaveError,
        handleJoinGroup,
        handleLeaveGroup,
    };
}
