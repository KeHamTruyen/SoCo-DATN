import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { groupApi } from "../../group/api/groupApi";
import type { Group } from "../../group/types/group.types";
import { queryKeys } from "../../../shared/query/queryKeys";

export function useGroupData(id: string | undefined) {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const groupKey = id ? queryKeys.group.detail(id) : ["group", "detail", "empty"];
    const groupQuery = useQuery({
        queryKey: groupKey,
        enabled: Boolean(id),
        queryFn: () => groupApi.getGroup(id!),
    });
    const joinByInviteMutation = useMutation({
        mutationFn: (inviteCode: string) => groupApi.joinByInvite(inviteCode),
        onSuccess() {
            void queryClient.invalidateQueries({ queryKey: groupKey });
        },
    });

    const setGroup: React.Dispatch<React.SetStateAction<Group | null>> = useCallback(
        (value) => {
            queryClient.setQueryData<Group | null>(groupKey, (prev) =>
                typeof value === "function" ? value(prev ?? null) : value,
            );
        },
        [groupKey, queryClient],
    );
    const group = groupQuery.data ?? null;

    useEffect(() => {
        const inviteCode = searchParams.get("invite");
        if (!id || !inviteCode || group?.isMember) return;
        void (async () => {
            try {
                await joinByInviteMutation.mutateAsync(inviteCode);
                setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete("invite");
                    return next;
                });
            } catch {
                // ignore invalid invite code
            }
        })();
    }, [group?.isMember, id, joinByInviteMutation, searchParams, setSearchParams]);

    return {
        group,
        setGroup,
        isLoading: groupQuery.isLoading,
    };
}
