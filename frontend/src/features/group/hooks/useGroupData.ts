import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { groupApi } from "../../group/api/groupApi";
import type { Group } from "../../group/types/group.types";

export function useGroupData(id: string | undefined) {
    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (!id) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await groupApi.getGroup(id);
                if (!mounted) return;
                setGroup(data);
            } catch {
                if (!mounted) return;
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    useEffect(() => {
        const inviteCode = searchParams.get("invite");
        if (!id || !inviteCode || group?.isMember) return;
        void (async () => {
            try {
                await groupApi.joinByInvite(inviteCode);
                setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete("invite");
                    return next;
                });
                const data = await groupApi.getGroup(id);
                setGroup(data);
            } catch {
                // ignore invalid invite code
            }
        })();
    }, [group?.isMember, id, searchParams, setSearchParams]);

    return {
        group,
        setGroup,
        isLoading,
    };
}
